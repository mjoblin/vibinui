import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Draft } from "immer";

// import { isMessage } from "./schemaValidators";
import {
    setAudioSources,
    setCurrentAudioSource,
    setCurrentFormat,
    setCurrentStream,
    setCurrentTrack,
    setPlayStatus,
    setPlayheadPosition,
    setRepeat,
    setShuffle,
} from "../features/playback/playbackSlice";
import { setCurrentTrackIndex, setEntries } from "../features/playlist/playlistSlice";
import { RootState } from "../app/store";

const MAX_MESSAGE_COUNT = 10;

// TODO: Consider how to more clearly handle vaguely-defined incoming message payloads. These
//  payloads can contain nested objects with arbitrary key/value pairs.
type SimpleObject = { [key: string | number]: any };

type MessageType = "StateVars" | "PlayState" | "Position";

type StateVarsPayload = {
    streamer_name: string;  // TODO: Should streamer_name and media_source_name be on VibinMessage?
    media_source_name: string;
    streamer: SimpleObject;
    vibin: SimpleObject;
}

type PlayerState = "buffering" | "ready" | "play" | "pause" | "stop" | "no_signal";

// TODO: Figure out if any of these are not optional. Making them all optional makes usage a little
//  awkward (having to always allow for their optionality on reference).
type PlayStatePayload = {
    state?: PlayerState;
    position?: number;
    presettable?: boolean;
    queue_index?: number;
    queue_length?: number;
    queue_id?: number;
    mode_repeat?: string;   // TODO: Determine valid values for repeat
    mode_shuffle?: string;   // TODO: Determine valid values for shuffle
    metadata?: {
        class?: string;
        source?: string;
        name?: string;
        playback_source?: string;
        track_number?: number;
        duration?: number;
        album?: string;
        artist?: string;
        title?: string;
        art_url?: string;
        sample_format?: string;
        mqa?: string;
        codec?: string;
        lossless?: boolean;
        sample_rate?: number;
        bit_depth?: number;
        encoding?: string;
    };
};

type PositionPayload = {
    position: number;
}

// TODO: More clearly define the vibin backend message format.
export type VibinMessage = {
    id: string;
    time: number;
    type: MessageType;
    payload: StateVarsPayload | PlayStatePayload | PositionPayload;
}

type ComparableMessageChunk = Draft<{ [key: number | string]: string }> | Map<any, any>;

/**
 * Compare the provided Draft object o1 with the provided o2. Return true if they appear to be
 * identical.
 *
 * Warning: This uses JSON.stringify() on the two inputs to determine equivalence, which can in
 * some situations return false negatives (say if the object key order has changed).
 *
 * @param o1
 * @param o2
 */
const quickObjectMatch = (o1: ComparableMessageChunk, o2: ComparableMessageChunk): boolean =>
    JSON.stringify(o1) === JSON.stringify(o2);

/**
 * Take some arbitrary input (scalar or SimpleObject) and purify it. Purify in this context means
 * checking if the input has any keys which contain a "-" (replaced with "_") or a "@" (removed).
 *
 * TODO: This is a simple attempt to take some weird-looking data shapes from the backend and make
 *  it more friendly to the application. This idea might need to be enhanced in the future.
 *
 * @param input
 */
const purifyData = (
    input: SimpleObject | any[] | string | number | undefined | null
): SimpleObject | any[] | string | number | undefined | null => {
    if ((typeof input !== "object") || input === null) {
        return input;
    }

    if (input instanceof Array) {
        const purified: any[] = input.map(value => purifyData(value));
        return purified;
    } else {
        const purified: SimpleObject = {};

        Object.keys(input).forEach((key) => {
            const purifiedKey = key.replaceAll("-", "_").replaceAll("@", "");
            purified[purifiedKey] = purifyData(input[key]);
        });

        return purified;
    }
};

/**
 * Handle an incoming Websocket message from the vibin backend.
 *
 * @param updateCachedData
 * @param getState
 * @param dispatch
 *
 *  1. Add the message to the message stream.
 *  2. Extract the following information (if present in the message) and, if the data has changed
 *     from the current application state, then dispatch redux actions to update the state:
 *      * Playback status
 *          * Playback state (paused, playing, etc.)
 *          * List of audio sources.
 *          * Current audio source.
 *          * Current track information (artist, title, etc).
 *          * Current format information (code, bitrate, etc).
 *      * Current playlist
 *
 * TODO: updateCachedData is coming from the QueryArg type, defined somewhere in Redux Toolkit. It
 *  would be nice to figure out how to access the proper type and not fall back on "any".
 *  messageHandler() might also benefit at some point from having the entire QueryArg object rather
 *  than just updateCachedData.
 *
 * TODO: The backend currently supports two message types (state var updates, and play state
 *  updates). Should these even be treated differently? (Their backend realities are different --
 *  UPNP vs. Websocket updates from the streamer -- but that distinction could be abstracted away).
 *  If continued to treat differently, then maybe the Client/UI could decide whether they want to
 *  receive one or both types -- perhaps by connecting to a Websocket channel per type; or sending
 *  a connect message where they say which type(s) they want to receive.
 *
 * TODO: Handle defining the current playhead position. Store it as normalized 0-1 in application
 *  state. Auto-update at regular interval (say 250ms). Heuristics:
 *      * When current track has changed, set playhead to 0.
 *      * Auto-update playhead position at regular interval.
 *      * Actions to consider (will interrupt regular-interval updates):
 *          * Track paused (pause updates; allow for pause happening mid-interval).
 *          * Track stopped (cancel playhead?).
 *          * Track seek (reset position).
 */
function messageHandler(
    updateCachedData: any,
    getState: () => any, // TODO: The return type here is really RootState
    dispatch: ThunkDispatch<any, any, any>
): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
        // TODO: Can message payload munging/purification be done by implementing transformResponse
        //  in the createApi definition?
        //  https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#customizing-query-responses-with-transformresponse
        const data = purifyData(JSON.parse(event.data)) as VibinMessage;

        // TODO: Consider adding message validation before attempting to process it.

        // Update the query result with the received message. We prevent the array of messages from
        // exceeding MAX_MESSAGE_COUNT to minimize the likelihood of memory issues and/or Redux
        // warning us about state size.
        updateCachedData((draft: VibinMessage[]) => {
            (draft.length >= MAX_MESSAGE_COUNT) && draft.shift();
            draft.push(data);
        });

        const appState = getState();

        /**
         * Update application state to newValue if newValue is different from the current state for
         * the given stateType. If newValue is undefined then set the application state to the
         * given defaultValue.
         *
         * @param stateType
         * @param newValue
         * @param defaultValue
         */
        const updateAppStateIfChanged = (
            stateType: string,
            newValue: any,
            defaultValue: any = undefined
        ): void => {
            // TODO: Not sure how to keep TS happy here if appState is explicitly of type RootState
            //  (which is why the return type of getState() is defined above as "any").
            const existingStateValue = appState[stateType];

            if (!quickObjectMatch(existingStateValue, newValue)) {
                dispatch({
                    type: stateType,
                    payload: newValue === undefined ? defaultValue : newValue,
                });
            }
        };

        if (data.type === "StateVars") {
            const stateVars = data.payload as StateVarsPayload;
            const streamerName = stateVars.streamer_name;

            if (!streamerName) {
                return;
            }

            // Set list of audio sources, and currently-set audio source.
            updateAppStateIfChanged(setAudioSources.type, stateVars.vibin[streamerName]?.audio_sources, {});

            updateAppStateIfChanged(
                setCurrentAudioSource.type,
                stateVars.vibin[streamerName]?.current_audio_source
            );

            // Set stream information.
            const streamInfo = stateVars.vibin[streamerName]?.current_playback_details?.stream;

            updateAppStateIfChanged(
                setCurrentStream.type,
                {
                    type: streamInfo.type,
                    source_name: streamInfo.source_name,
                    url: streamInfo.url,
                }
            );

            // Extract track genre, checking to ensure that the message's track matches the track
            // in application state.
            //
            // NOTE: This assumes we'll be getting a StateVars message for the track *after* we've
            //  seen a PlayState message defining the new track.
            const stateVarsTrack =
                stateVars.vibin[streamerName]?.current_playback_details?.playlist_entry;
            const appStateTrack = appState[setCurrentTrack.type];
            
            if (
                stateVarsTrack &&
                appStateTrack &&
                stateVarsTrack.genre &&
                appStateTrack.title === stateVarsTrack.title &&
                appStateTrack.album === stateVarsTrack.album &&
                appStateTrack.artist === stateVarsTrack.artist
            ) {
                updateAppStateIfChanged(setCurrentTrack.type, {
                    ...appState[setCurrentTrack.type],
                    genre: stateVarsTrack.genre,
                });
            }

            // Set current playlist track index and entries.
            updateAppStateIfChanged(
                setCurrentTrackIndex.type,
                stateVars.vibin[streamerName]?.current_playlist_track_index
            );
            updateAppStateIfChanged(
                setEntries.type,
                stateVars.vibin[streamerName]?.current_playlist
            );
        }
        else if (data.type === "Position") {
            dispatch({
                type: setPlayheadPosition.type,
                payload: (data.payload as PositionPayload).position,
            });
        }
        else if (data.type === "PlayState") {
            const metadata = (data.payload as PlayStatePayload).metadata;

            // Set current play status ("play", "pause", etc).
            updateAppStateIfChanged(setPlayStatus.type, (data.payload as PlayStatePayload).state);

            // Set track information.
            // NOTE: genre comes later from a StateVars message.
            updateAppStateIfChanged(
                setCurrentTrack.type,
                {
                    track_number: metadata?.track_number,
                    duration: metadata?.duration,
                    album: metadata?.album,
                    artist: metadata?.artist,
                    title: metadata?.title,
                    art_url: metadata?.art_url,
                }
            );

            // Set format information.
            updateAppStateIfChanged(
                setCurrentFormat.type,
                {
                    sample_format: metadata?.sample_format,
                    mqa: metadata?.mqa,
                    codec: metadata?.codec,
                    lossless: metadata?.lossless,
                    sample_rate: metadata?.sample_rate,
                    bit_depth: metadata?.bit_depth,
                    encoding: metadata?.encoding,
                }
            );

            // Set repeat and shuffle.
            updateAppStateIfChanged(setRepeat.type, (data.payload as PlayStatePayload).mode_repeat);

            updateAppStateIfChanged(
                setShuffle.type,
                (data.payload as PlayStatePayload).mode_shuffle
            );
        }
    };
}

// ------------------------------------------------------------------------------------------------

export const vibinWebsocket = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (build) => ({
        getMessages: build.query<VibinMessage[], void>({
            // The vibin backend currently doesn't have an endpoint to retrieve the initial state
            // for the message stream data (this information is instead sent in the first message
            // immediately on connection). We instead just initialize with an empty Message array.
            queryFn: () => ({ data: [] }),
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState, dispatch }
            ) {
                // create a websocket connection when the cache subscription starts
                const ws = new WebSocket(`ws://${window.location.hostname}:7669/ws`);

                try {
                    // Wait for the initial query to resolve before proceeding.
                    await cacheDataLoaded;

                    const listener = messageHandler(updateCachedData, getState, dispatch);
                    ws.addEventListener("message", listener);
                } catch {
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                    // in which case `cacheDataLoaded` will throw
                }

                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved;

                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                ws.close();
            },
        }),
    }),
});

export const { useGetMessagesQuery } = vibinWebsocket;

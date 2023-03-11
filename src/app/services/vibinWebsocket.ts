import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Draft } from "immer";

import { setMediaDeviceName, setStreamerName, setStreamerPower } from "../store/systemSlice";
import {
    DeviceDisplay,
    PlayStatus,
    RepeatState,
    setActiveTransportActions,
    setAudioSources,
    setCurrentAudioSource,
    setCurrentFormat,
    setCurrentStream,
    setCurrentTrack,
    setCurrentTrackMediaId,
    setCurrentAlbumMediaId,
    setDeviceDisplay,
    setPlayStatus,
    setPlayheadPosition,
    setRepeat,
    setShuffle,
    ShuffleState,
    TransportAction,
} from "../store/playbackSlice";
import { setCurrentTrackIndex, setEntries } from "../store/playlistSlice";
import { setPresetsState, PresetsState } from "../store/presetsSlice";
import { setStoredPlaylistsState, StoredPlaylistsState } from "../store/storedPlaylistsSlice";

const MAX_MESSAGE_COUNT = 10;

// TODO: Consider how to more clearly handle vaguely-defined incoming message payloads. These
//  payloads can contain nested objects with arbitrary key/value pairs.
type SimpleObject = { [key: string | number]: any };

type MessageType =
    | "ActiveTransportControls"
    | "DeviceDisplay"
    | "PlayState"
    | "Position"
    | "Presets"
    | "StateVars"
    | "StoredPlaylists"
    | "System";

type ActiveTransportControlsPayload = TransportAction[];

type DeviceDisplayPayload = DeviceDisplay;

type SystemPayload = {
    streamer: {
        name: string;
        power: "on" | "off";
    };
    media_device: {
        name: string;
    };
};

type StateVarsPayload = {
    streamer_name: string; // TODO: Should streamer_name and media_source_name be on VibinMessage?
    media_source_name: string;
    streamer: SimpleObject;
    vibin: SimpleObject;
};

// TODO: Figure out if any of these are not optional. Making them all optional makes usage a little
//  awkward (having to always allow for their optionality on reference). Also investigate
//  formalizing some of these types, and find a suitable place fro those types to live.
type PlayStatePayload = {
    state?: PlayStatus;
    position?: number;
    presettable?: boolean;
    queue_index?: number;
    queue_length?: number;
    queue_id?: number;
    mode_repeat?: RepeatState;
    mode_shuffle?: ShuffleState;
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
        current_track_media_id: string | undefined;
        current_album_media_id: string | undefined;
    };
};

type PositionPayload = {
    position: number;
};

type PresetsPayload = PresetsState;

type StoredPlaylistsPayload = StoredPlaylistsState;

// TODO: More clearly define the vibin backend message format.
export type VibinMessage = {
    id: string;
    time: number;
    type: MessageType;
    payload:
        | ActiveTransportControlsPayload
        | DeviceDisplayPayload
        | PlayStatePayload
        | PositionPayload
        | PresetsPayload
        | StateVarsPayload
        | StoredPlaylistsPayload
        | SystemPayload;
};

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
    if (typeof input !== "object" || input === null) {
        return input;
    }

    if (input instanceof Array) {
        const purified: any[] = input.map((value) => purifyData(value));
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
            draft.length >= MAX_MESSAGE_COUNT && draft.shift();
            draft.push(data);
        });

        const appState = getState();

        if (data.type === "System") {
            const system = data.payload as SystemPayload;

            dispatch(setMediaDeviceName(system.media_device?.name));
            dispatch(setStreamerName(system.streamer?.name));
            dispatch(setStreamerPower(system.streamer?.power));
        } else if (data.type === "StateVars") {
            const stateVars = data.payload as StateVarsPayload;
            const streamerName = stateVars.streamer_name;

            if (!streamerName) {
                return;
            }

            // Set list of audio sources, and currently-set audio source.
            dispatch(setAudioSources(stateVars.vibin[streamerName]?.audio_sources || {}));
            dispatch(setCurrentAudioSource(stateVars.vibin[streamerName]?.current_audio_source));

            // Set stream information.
            const streamInfo = stateVars.vibin[streamerName]?.current_playback_details?.stream;

            streamInfo &&
                dispatch(
                    setCurrentStream({
                        type: streamInfo.type,
                        source_name: streamInfo.source_name,
                        url: streamInfo.url,
                    })
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
                dispatch(
                    setCurrentTrack({
                        ...appState[setCurrentTrack.type],
                        genre: stateVarsTrack.genre,
                    })
                );
            }

            // Set current playlist track index and entries.
            dispatch(
                setCurrentTrackIndex(stateVars.vibin[streamerName]?.current_playlist_track_index)
            );
            dispatch(setEntries(stateVars.vibin[streamerName]?.current_playlist));
        } else if (data.type === "Position") {
            dispatch({
                type: setPlayheadPosition.type,
                payload: (data.payload as PositionPayload).position,
            });
        } else if (data.type === "PlayState") {
            const metadata = (data.payload as PlayStatePayload).metadata;

            // Set current play status ("play", "pause", etc).
            dispatch(setPlayStatus((data.payload as PlayStatePayload).state));

            // Set current Track and Album Media IDs.
            dispatch(
                setCurrentTrackMediaId(
                    (data.payload as PlayStatePayload).metadata?.current_track_media_id
                )
            );
            dispatch(
                setCurrentAlbumMediaId(
                    (data.payload as PlayStatePayload).metadata?.current_album_media_id
                )
            );

            // Set track information.
            // NOTE: genre comes later from a StateVars message.
            metadata &&
                dispatch(
                    setCurrentTrack({
                        track_number: metadata.track_number,
                        duration: metadata.duration,
                        album: metadata.album,
                        artist: metadata.artist,
                        title: metadata.title,
                        art_url: metadata.art_url,
                    })
                );

            // Set format information.
            metadata &&
                dispatch(
                    setCurrentFormat({
                        sample_format: metadata.sample_format,
                        mqa: metadata.mqa,
                        codec: metadata.codec,
                        lossless: metadata.lossless,
                        sample_rate: metadata.sample_rate,
                        bit_depth: metadata.bit_depth,
                        encoding: metadata.encoding,
                    })
                );

            // Set repeat and shuffle.
            dispatch(setRepeat((data.payload as PlayStatePayload).mode_repeat));
            dispatch(setShuffle((data.payload as PlayStatePayload).mode_shuffle));
        } else if (data.type === "ActiveTransportControls") {
            dispatch(setActiveTransportActions(data.payload as ActiveTransportControlsPayload));
        } else if (data.type === "DeviceDisplay") {
            dispatch(setDeviceDisplay(data.payload as DeviceDisplayPayload));
        } else if (data.type === "Presets") {
            dispatch(setPresetsState(data.payload as PresetsState));
        } else if (data.type === "StoredPlaylists") {
            dispatch(setStoredPlaylistsState(data.payload as StoredPlaylistsPayload));
        }
    };
}

// ------------------------------------------------------------------------------------------------

export const vibinWebsocket = createApi({
    reducerPath: "vibinWebsocket",
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

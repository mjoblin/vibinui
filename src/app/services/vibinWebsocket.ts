import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ThunkDispatch } from "@reduxjs/toolkit";

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
import { WEBSOCKET_RECONNECT_DELAY, WEBSOCKET_URL } from "../constants";
import { setWebsocketClientId, setWebsocketStatus } from "../store/internalSlice";
import { setCurrentTrackIndex, setEntries } from "../store/playlistSlice";
import { setPresetsState, PresetsState } from "../store/presetsSlice";
import { setFavoritesState, FavoritesState } from "../store/favoritesSlice";
import { setStoredPlaylistsState, StoredPlaylistsState } from "../store/storedPlaylistsSlice";
import { setVibinStatusState, VibinStatusState } from "../store/vibinStatusSlice";

// ================================================================================================
// Handle the WebSocket connection to the vibin backend.
//
// Key features:
//  * Connect to the backend and handle reconnecting when required.
//  * Handle incoming WebSocket messages.
//  * Dispatch any useful information from these messages to application state, for use elsewhere
//    in the application.
//
// Note:
//  * Messages only flow from the backend to the UI, and not the other way.
//  * When the UI connects to the backend, the backend will automatically send messages describing
//    the backend state at connection time. The UI does not need to pre-fetch this initial state;
//    the initial state is instead handled like any other message.
// ================================================================================================

const MAX_MESSAGE_COUNT = 10;

// TODO: Consider how to more clearly handle vaguely-defined incoming message payloads. These
//  payloads can contain nested objects with arbitrary key/value pairs.
type SimpleObject = { [key: string | number]: any };

type MessageType =
    | "ActiveTransportControls"
    | "DeviceDisplay"
    | "Favorites"
    | "PlayState"
    | "Position"
    | "Presets"
    | "StateVars"
    | "StoredPlaylists"
    | "System"
    | "VibinStatus";

type ActiveTransportControlsPayload = TransportAction[];

type DeviceDisplayPayload = DeviceDisplay;

type SystemPayload = {
    streamer: {
        name: string;
        power: "on" | "off";
    };
    media: {
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

type FavoritesPayload = FavoritesState;

type StoredPlaylistsPayload = StoredPlaylistsState;

type VibinStatusPayload = VibinStatusState;

// TODO: More clearly define the vibin backend message format.
export type VibinMessage = {
    id: string;
    client_id: string;
    time: number;
    type: MessageType;
    payload:
        | ActiveTransportControlsPayload
        | DeviceDisplayPayload
        | FavoritesPayload
        | PlayStatePayload
        | PositionPayload
        | PresetsPayload
        | StateVarsPayload
        | StoredPlaylistsPayload
        | SystemPayload
        | VibinStatusPayload;
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
 * Handle an incoming WebSocket message from the vibin backend.
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
 *  UPNP vs. WebSocket updates from the streamer -- but that distinction could be abstracted away).
 *  If continued to treat differently, then maybe the Client/UI could decide whether they want to
 *  receive one or both types -- perhaps by connecting to a WebSocket channel per type; or sending
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

            dispatch(setMediaDeviceName(system.media?.name));
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
        } else if (data.type === "Favorites") {
            dispatch(setFavoritesState(data.payload as FavoritesPayload));
        } else if (data.type === "Presets") {
            dispatch(setPresetsState(data.payload as PresetsState));
        } else if (data.type === "StoredPlaylists") {
            dispatch(setStoredPlaylistsState(data.payload as StoredPlaylistsPayload));
        } else if (data.type === "VibinStatus") {
            dispatch(setVibinStatusState(data.payload as VibinStatusPayload));

            // Every incoming message has a client_id. Rather than storing this client_id in
            // application state based on every incoming message, limit it to just VibinStatus
            // messages.
            dispatch(setWebsocketClientId(data.client_id));
        }
    };
}

// ------------------------------------------------------------------------------------------------

export const vibinWebsocket = createApi({
    reducerPath: "vibinWebsocket",
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (build) => ({
        getMessages: build.query<VibinMessage[], void>({
            // The vibin backend does not have an endpoint to retrieve the initial state of the
            // message stream data. This information is instead sent in messages received by the
            // client immediately on connection. As a result, we initialize with an empty Message
            // array.
            //
            // Additionally, this means we do not use RTK Query's "cacheDataLoaded" feature. So
            // cacheDataLoaded is not awaited after establishing the connection.
            queryFn: () => ({ data: [] }),
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState, dispatch }
            ) {
                const connectToVibinServer = async () => {
                    dispatch(setWebsocketStatus("connecting"));
                    const ws = new WebSocket(WEBSOCKET_URL);
                    const listener = messageHandler(updateCachedData, getState, dispatch);

                    const onConnected = () => {
                        dispatch(setWebsocketStatus("connected"));
                    };

                    const onDisconnected = () => {
                        dispatch(setWebsocketStatus("waiting_to_reconnect"));
                        setTimeout(connectToVibinServer, WEBSOCKET_RECONNECT_DELAY);
                    };

                    ws.addEventListener("open", onConnected);
                    ws.addEventListener("message", listener);
                    ws.addEventListener("close", onDisconnected);

                    // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                    await cacheEntryRemoved;
                    ws.close();
                };

                await connectToVibinServer();
                
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved;
            },
        }),
    }),
});

export const { useGetMessagesQuery, useLazyGetMessagesQuery } = vibinWebsocket;

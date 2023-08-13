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
import { AudioSource } from "../store/playbackSlice";
import { setCurrentTrackIndex, setEntries } from "../store/activePlaylistSlice";
import { setPresetsState, PresetsState } from "../store/presetsSlice";
import { setFavoritesState, FavoritesState } from "../store/favoritesSlice";
import { setStoredPlaylistsState, StoredPlaylistsState } from "../store/storedPlaylistsSlice";
import { setVibinStatusState, VibinStatusState } from "../store/vibinStatusSlice";
import { MediaId, PlaylistEntry } from "../types";

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
    | "CurrentlyPlaying"
    | "Favorites"
    | "Position"
    | "Presets"
    | "StoredPlaylists"
    | "System"
    | "TransportState"
    | "UPnPProperties"
    | "VibinStatus";

// ------------------------------------------------------------------------------------------------
// TODO: Figure out where these new types should live

type ActiveTrack = {
    title: string;
    artist: string;
    album: string;
    art_url: string;
    duration: number;
};

type MediaFormat = {
    sample_format: string;
    mqa: string;
    codec: string;
    lossless: boolean,
    sample_rate: number;
    bit_depth: number;
    encoding: string;
};

type MediaStream = {
    url: string;
};

// TODO: End new types
// ------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------
// Message payload shapes.

type CurrentlyPlayingPayload = {
    album_media_id: MediaId;
    track_media_id: MediaId;
    active_track: ActiveTrack;
    playlist: {
        current_track_index: number;
        entries: PlaylistEntry[];
    };
    format: MediaFormat;
    stream: MediaStream;
};

type FavoritesPayload = FavoritesState;

type PositionPayload = {
    position: number;
};

type PresetsPayload = PresetsState;

type StoredPlaylistsPayload = StoredPlaylistsState;

type SystemPayload = {
    streamer: {
        name: string;
        power: "on" | "off";
        sources: {
            active: AudioSource,
            available: AudioSource[],
        };
        display: DeviceDisplay;
    };
    media: {
        name: string;
    };
};

type TransportStatePayload = {
    play_state: PlayStatus,
    active_controls: TransportAction[],
    repeat: RepeatState,
    shuffle: ShuffleState,
};

type UPnPPropertiesPayload = {
    streamer_name: string; // TODO: Should streamer_name and media_source_name be on VibinMessage?
    media_source_name: string;
    streamer: SimpleObject;
    media_server: SimpleObject;
    vibin: SimpleObject;
};

type VibinStatusPayload = VibinStatusState;

// ------------------------------------------------------------------------------------------------
// The overall message shape.

export type VibinMessage = {
    id: string;
    client_id: string;
    time: number;
    type: MessageType;
    payload:
        | CurrentlyPlayingPayload
        | FavoritesPayload
        | PositionPayload
        | PresetsPayload
        | StoredPlaylistsPayload
        | SystemPayload
        | TransportStatePayload
        | UPnPPropertiesPayload
        | VibinStatusPayload;
};

// ------------------------------------------------------------------------------------------------

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
 *  2. Check the message type ("CurrentlyPlaying", "Favorites", etc) and use the information in the
 *     message payload to dispatch updates to application state.
 *
 * TODO: updateCachedData is coming from the QueryArg type, defined somewhere in Redux Toolkit. It
 *  would be nice to figure out how to access the proper type and not fall back on "any".
 *  messageHandler() might also benefit at some point from having the entire QueryArg object rather
 *  than just updateCachedData.
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

        if (data.type === "CurrentlyPlaying") {
            const currentlyPlaying = data.payload as CurrentlyPlayingPayload;

            dispatch(setCurrentTrack({
                id: currentlyPlaying.track_media_id,  // id will be undefined for non-local media
                ...currentlyPlaying.active_track
            }));
            dispatch(setCurrentTrackMediaId(currentlyPlaying.track_media_id));
            dispatch(setCurrentAlbumMediaId(currentlyPlaying.album_media_id));
            dispatch(setCurrentFormat(currentlyPlaying.format));
            dispatch(setCurrentStream(currentlyPlaying.stream));
            dispatch(setCurrentTrackIndex(currentlyPlaying.playlist.current_track_index));
            dispatch(setEntries(currentlyPlaying.playlist.entries));
        } else if (data.type === "Favorites") {
            dispatch(setFavoritesState(data.payload as FavoritesPayload));
        } else if (data.type === "Position") {
            dispatch({
                type: setPlayheadPosition.type,
                payload: (data.payload as PositionPayload).position,
            });
        } else if (data.type === "Presets") {
            dispatch(setPresetsState(data.payload as PresetsState));
        } else if (data.type === "StoredPlaylists") {
            dispatch(setStoredPlaylistsState(data.payload as StoredPlaylistsPayload));
        } else if (data.type === "System") {
            const system = data.payload as SystemPayload;

            dispatch(setMediaDeviceName(system.media?.name));
            dispatch(setStreamerName(system.streamer?.name));
            dispatch(setStreamerPower(system.streamer?.power));
            dispatch(setAudioSources(system.streamer?.sources.available))
            dispatch(setCurrentAudioSource(system.streamer?.sources.active))
            dispatch(setDeviceDisplay(system.streamer?.display));
        } else if (data.type === "TransportState") {
            const payload = data.payload as TransportStatePayload;

            dispatch(setPlayStatus(payload.play_state));  // "play", "pause", etc
            dispatch(setActiveTransportActions(payload.active_controls));
            dispatch(setRepeat(payload.repeat));
            dispatch(setShuffle(payload.shuffle));
        } else if (data.type === "UPnPProperties") {
            // TODO: This is where the current track's genre used to be extracted from. Investigate
            //  where best to find genre now. The ultimate dispatch for genre looked like:
            //
            // dispatch(
            //     setCurrentTrack({
            //         ...appState[setCurrentTrack.type],
            //         genre: upnpPropertiesTrack.genre,
            //     })
            // );
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

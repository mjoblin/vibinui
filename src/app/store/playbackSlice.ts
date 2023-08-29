import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Format, MediaId, Stream, Track } from "../types";
import { updateIfDifferent } from "./helpers";

// ================================================================================================
// Application state for the current streamer playback status. (Current play status, playhead
// position, currently-valid transport actions, current track and album ids, active media source,
// etc).
// ================================================================================================

export type PlayStatus =
    | "buffering"
    | "connecting"
    | "no_signal"
    | "not_ready"
    | "pause"
    | "play"
    | "ready"
    | "stop";

// Transports might support various flavors of stopping/starting playback. "stop" stops playback,
// "play" starts/resumes playback, "pause" pauses playback, and "toggle_playback" essentially
// toggles between the "play" and "pause" states. Exactly what this means depends on the streamer
// implementation.
export type TransportAction =
    | "next"
    | "pause"
    | "play"
    | "previous"
    | "repeat"
    | "seek"
    | "shuffle"
    | "stop"
    | "toggle_playback";

export type RepeatState = "off" | "all";

export type ShuffleState = "off" | "all";

// TODO: Rename top-level state fields from snake_case to camelCase.

// TODO: Clarify current_track_media_id vs current_track. The former is valid for local media and
//  is the source of truth for the playing track id. current_track however is also populated by
//  other sources like AirPlay. It would be good to either merge these, or be clearer about when
//  to use what.

export interface PlaybackState {
    play_status: PlayStatus | undefined;
    active_transport_actions: TransportAction[];
    // TODO: The current_track will either be a complete Track (when the track is being sourced from
    //  local media where the complete Track details are known); or a partial Track (when the track
    //  is being sourced from a non-local source like AirPlay, where only some Track details are
    //  known. This is a little messy and can result in different keys for things like the art url.
    //  This should be cleaned up to properly support a more flexible-yet-consistent Track
    //  definition. That said, the current_track can be assumed to provide as much Track information
    //  as possible for what is currently playing, regardless of source.
    current_track: Track | undefined;
    // TODO: For the "current ids", consider adding Artist -- and also storing full
    //  Artist/Album/Track objects rather than just ids (so the other information, like title, is
    //  more easily accessible when required).
    //
    //  These will need to be distinct from artist/album/track information which is not associated
    //  with local media (e.g. Airplay). These should probably be undefined when not playing from
    //  local media.
    current_track_media_id: MediaId | undefined;
    current_album_media_id: MediaId | undefined;
    current_format: Format | undefined;
    current_stream: Stream | undefined;
    repeat: RepeatState | undefined;
    shuffle: ShuffleState | undefined;
    playhead: {
        position: number;
        position_normalized: number;
    };
}

const initialState: PlaybackState = {
    play_status: undefined,
    active_transport_actions: [],
    current_track: undefined,
    current_track_media_id: undefined,
    current_album_media_id: undefined,
    current_format: undefined,
    current_stream: undefined,
    repeat: undefined,
    shuffle: undefined,
    playhead: {
        position: 0,
        position_normalized: 0,
    },
};

export const playbackSlice = createSlice({
    name: "playback",
    initialState,
    reducers: {
        restartPlayhead: (state) => {
            state.playhead.position = 0;
            state.playhead.position_normalized = 0;
        },
        setActiveTransportActions: (state, action: PayloadAction<TransportAction[]>) => {
            updateIfDifferent(state, "active_transport_actions", action.payload);
        },
        setCurrentFormat: (state, action: PayloadAction<Partial<Format> | undefined>) => {
            updateIfDifferent(state, "current_format", action.payload);
        },
        setCurrentStream: (state, action: PayloadAction<Stream | undefined>) => {
            updateIfDifferent(state, "current_stream", action.payload);
        },
        setCurrentTrack: (state, action: PayloadAction<Partial<Track> | undefined>) => {
            updateIfDifferent(state, "current_track", action.payload);
        },
        setCurrentTrackMediaId: (state, action: PayloadAction<MediaId | undefined>) => {
            updateIfDifferent(state, "current_track_media_id", action.payload);
        },
        setCurrentAlbumMediaId: (state, action: PayloadAction<MediaId | undefined>) => {
            updateIfDifferent(state, "current_album_media_id", action.payload);
        },
        setPlayStatus: (state, action: PayloadAction<PlayStatus | undefined>) => {
            updateIfDifferent(state, "play_status", action.payload);
        },
        setPlayheadPosition: (state, action: PayloadAction<number>) => {
            state.playhead.position = action.payload;
        },
        setPlayheadPositionNormalized: (state, action: PayloadAction<number>) => {
            state.playhead.position_normalized = action.payload;
        },
        setRepeat: (state, action: PayloadAction<RepeatState | undefined>) => {
            updateIfDifferent(state, "repeat", action.payload);
        },
        setShuffle: (state, action: PayloadAction<ShuffleState | undefined>) => {
            updateIfDifferent(state, "shuffle", action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    restartPlayhead,
    setActiveTransportActions,
    setCurrentFormat,
    setCurrentStream,
    setCurrentTrack,
    setCurrentTrackMediaId,
    setCurrentAlbumMediaId,
    setPlayStatus,
    setPlayheadPosition,
    setPlayheadPositionNormalized,
    setRepeat,
    setShuffle,
} = playbackSlice.actions;

export default playbackSlice.reducer;

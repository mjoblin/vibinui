import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Format, MediaId, Stream, Track } from "../types";

/**
 * The Playback slice is intended to contain information about the current playback status of the
 * streamer. e.g. Whether it's playing or not; what the current track is; etc.
 */

export type PlayStatus = "buffering" | "play" | "pause" | "ready" | "not_ready" | "connecting";  // TODO: not_ready === standby?

export type AudioSource = {
    id: string;
    name: string;
    default_name: string;
    class: string;
    nameable: boolean;
    ui_selectable: boolean;
    description: string;
    description_locale: string;
    preferred_order: number;
};

export type RepeatState = "off" | "all";

export type ShuffleState = "off" | "all";

// TODO: Rename top-level state fields from snake_case to camelCase.

export interface PlaybackState {
    play_status: PlayStatus | undefined;
    audio_sources: {    // TODO: Audio Sources doesn't belong in current playback slice
        [key: number]: AudioSource;
    };
    current_audio_source: AudioSource | undefined;
    current_track: Track | undefined;
    current_track_media_id: MediaId | undefined;
    current_album_media_id: MediaId | undefined;
    current_format: Format | undefined;
    current_stream: Stream | undefined;
    repeat: RepeatState | undefined;
    shuffle: ShuffleState | undefined;
    playhead: {
        position: number;
        position_normalized: number;
    }
}

const initialState: PlaybackState = {
    play_status: undefined,
    audio_sources: {},
    current_audio_source: undefined,
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
    }
};

export const playbackSlice = createSlice({
    name: "playback",
    initialState,
    reducers: {
        restartPlayhead: (state) => {
            state.playhead.position = 0;
            state.playhead.position_normalized = 0;
        },
        setAudioSources: (state, action: PayloadAction<{ [key: number]: AudioSource }>) => {
            state.audio_sources = action.payload;
        },
        setCurrentAudioSource: (state, action: PayloadAction<AudioSource | undefined>) => {
            state.current_audio_source = action.payload;
        },
        setCurrentFormat: (state, action: PayloadAction<Format | undefined>) => {
            state.current_format = action.payload;
        },
        setCurrentStream: (state, action: PayloadAction<Stream | undefined>) => {
            state.current_stream = action.payload;
        },
        setCurrentTrack: (state, action: PayloadAction<Track | undefined>) => {
            state.current_track = action.payload;
        },
        setCurrentTrackMediaId: (state, action: PayloadAction<MediaId | undefined>) => {
            state.current_track_media_id = action.payload;
        },
        setCurrentAlbumMediaId: (state, action: PayloadAction<MediaId | undefined>) => {
            state.current_album_media_id = action.payload;
        },
        setPlayStatus: (state, action: PayloadAction<PlayStatus | undefined>) => {
            state.play_status = action.payload;
        },
        setPlayheadPosition: (state, action: PayloadAction<number>) => {
            state.playhead.position = action.payload;
        },
        setPlayheadPositionNormalized: (state, action: PayloadAction<number>) => {
            state.playhead.position_normalized = action.payload;
        },
        setRepeat: (state, action: PayloadAction<RepeatState | undefined>) => {
            state.repeat = action.payload;
        },
        setShuffle: (state, action: PayloadAction<ShuffleState | undefined>) => {
            state.shuffle = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    restartPlayhead,
    setAudioSources,
    setCurrentAudioSource,
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

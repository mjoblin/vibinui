import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Format, Track } from "../../app/types";

/**
 * The Playback slice is intended to contain information about the current playback status of the
 * streamer. e.g. Whether it's playing or not; what the current track is; etc.
 */

export type PlayStatus = "Stopped" | "Playing" | "Paused" | "Connecting";

export type AudioSource = string;

export interface PlaybackState {
    play_status: PlayStatus | undefined;
    audio_sources: {
        [key: number]: AudioSource;
    };
    current_audio_source: AudioSource | undefined;
    current_track: Track | undefined;
    current_format: Format | undefined;
}

const initialState: PlaybackState = {
    play_status: undefined,
    audio_sources: {},
    current_audio_source: undefined,
    current_track: undefined,
    current_format: undefined,
};

export const playbackSlice = createSlice({
    name: "playback",
    initialState,
    reducers: {
        setAudioSources: (state, action: PayloadAction<{ [key: number]: AudioSource }>) => {
            state.audio_sources = action.payload;
        },
        setCurrentAudioSource: (state, action: PayloadAction<AudioSource | undefined>) => {
            state.current_audio_source = action.payload;
        },
        setCurrentFormat: (state, action: PayloadAction<Format | undefined>) => {
            state.current_format = action.payload;
        },
        setCurrentTrack: (state, action: PayloadAction<Track | undefined>) => {
            state.current_track = action.payload;
        },
        setPlayStatus: (state, action: PayloadAction<PlayStatus | undefined>) => {
            state.play_status = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setAudioSources,
    setCurrentAudioSource,
    setCurrentFormat,
    setCurrentTrack,
    setPlayStatus,
} = playbackSlice.actions;

export default playbackSlice.reducer;

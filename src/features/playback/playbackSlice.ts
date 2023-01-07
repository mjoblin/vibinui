import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";

export type PlayStatus = "Stopped" | "Playing" | "Paused" | "Connecting";

type ComparableObject = Draft<{[key: number | string] : string}> | Map<any, any>;

const quickObjectMatch = (o1: ComparableObject, o2: ComparableObject): boolean =>
    JSON.stringify(o1) === JSON.stringify(o2);

export interface PlaybackState {
    play_status: PlayStatus | undefined;
    audio_sources: {
        [key: number]: string;
    };
    current_audio_source: string | undefined;
    current_track: {
        title: string;
        artist: string;
        album: string;
        album_art_url: string;
        duration: string;
    } | undefined;
}

const initialState: PlaybackState = {
    play_status: undefined,
    audio_sources: {},
    current_audio_source: undefined,
    current_track: undefined,
};

export const playbackSlice = createSlice({
    name: "playback",
    initialState,
    reducers: {
        setAudioSources: (state, action: PayloadAction<{[key: number]: string}>) => {
            // TODO: Check if there's a preferred approach to not updating a
            //  chunk of state to what is effectively the same value. We'll
            //  encounter same-value data chunks a lot, as messages from the
            //  vibin backend will often include unchanged data.
            if (!quickObjectMatch(state.audio_sources, action.payload)) {
                state.audio_sources = action.payload;
            }
        },
        setPlayStatus: (state, action: PayloadAction<PlayStatus | undefined>) => {
            state.play_status = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setAudioSources, setPlayStatus } = playbackSlice.actions;

export default playbackSlice.reducer;

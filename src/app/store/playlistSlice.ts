import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Playlist } from "../types";
import { updateIfDifferent } from "./helpers";

// ================================================================================================
// Application state for the active streamer Playlist.
//
// Note: This is distinct from Stored Playlists.
// ================================================================================================

/**
 * TODO: Determine whether both store/playlistSlice and services/vibinPlaylist should coexists.
 *  Perhaps everything should be managed in services/vibinPlaylist.
 */

export interface PlaylistState {
    entries: Playlist | undefined;
    current_track_index: number | undefined;
    haveReceivedInitialState: boolean;
}

const initialState: PlaylistState = {
    entries: undefined,
    current_track_index: undefined,
    haveReceivedInitialState: false,
};

export const playlistSlice = createSlice({
    name: "playlist",
    initialState,
    reducers: {
        setCurrentTrackIndex: (state, action: PayloadAction<number | undefined>) => {
            updateIfDifferent(state, "current_track_index", action.payload);
        },
        setEntries: (state, action: PayloadAction<Playlist | undefined>) => {
            updateIfDifferent(state, "entries", action.payload);
            state.haveReceivedInitialState = true;
        },
        setHaveReceivedInitialState: (state, action: PayloadAction<boolean>) => {
            state.haveReceivedInitialState = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setCurrentTrackIndex, setEntries, setHaveReceivedInitialState } =
    playlistSlice.actions;

export default playlistSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { StoredPlaylist, StoredPlaylistId } from "../services/vibinStoredPlaylists";

// ================================================================================================
// Application state for Stored Playlists.
//
// Note: This is distinct from the active streamer Playlist.
// ================================================================================================

export interface StoredPlaylistsState {
    playlists: StoredPlaylist[];
    status: {
        active_id: StoredPlaylistId | undefined;
        is_active_synced_with_store: boolean;
        is_activating_playlist: boolean;
    };
}

const initialState: StoredPlaylistsState = {
    playlists: [],
    status: {
        active_id: undefined,
        is_active_synced_with_store: false,
        is_activating_playlist: false,
    },
};

export const storedPlaylistsSlice = createSlice({
    name: "storedPlaylists",
    initialState,
    reducers: {
        setStoredPlaylistsState: (state, action: PayloadAction<StoredPlaylistsState>) => {
            state.playlists = action.payload.playlists;
            state.status.active_id = action.payload.status.active_id;
            state.status.is_active_synced_with_store = action.payload.status.is_active_synced_with_store;
            state.status.is_activating_playlist = action.payload.status.is_activating_playlist;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setStoredPlaylistsState } = storedPlaylistsSlice.actions;

export default storedPlaylistsSlice.reducer;

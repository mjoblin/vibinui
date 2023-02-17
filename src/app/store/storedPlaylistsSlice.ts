import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { StoredPlaylist, StoredPlaylistId } from "../services/vibinStoredPlaylists";

export interface StoredPlaylistsState {
    active_stored_playlist_id: StoredPlaylistId | undefined;
    active_synced_with_store: boolean;
    activating_stored_playlist: boolean;
    stored_playlists: StoredPlaylist[];
}

const initialState: StoredPlaylistsState = {
    active_stored_playlist_id: undefined,
    active_synced_with_store: false,
    activating_stored_playlist: false,
    stored_playlists: [],
};

export const storedPlaylistsSlice = createSlice({
    name: "storedPlaylists",
    initialState,
    reducers: {
        setStoredPlaylistsState: (state, action: PayloadAction<StoredPlaylistsState>) => {
            state.active_stored_playlist_id = action.payload.active_stored_playlist_id;
            state.active_synced_with_store = action.payload.active_synced_with_store;
            state.activating_stored_playlist = action.payload.activating_stored_playlist;
            state.stored_playlists = action.payload.stored_playlists;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setStoredPlaylistsState } = storedPlaylistsSlice.actions;

export default storedPlaylistsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Playlist } from "../../app/types";

/**
 */

export interface PlaylistState {
    entries: Playlist | undefined;
}

const initialState: PlaylistState = {
    entries: undefined,
};

export const playlistSlice = createSlice({
    name: "playlist",
    initialState,
    reducers: {
        setEntries: (state, action: PayloadAction<Playlist | undefined>) => {
            state.entries = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setEntries } = playlistSlice.actions;

export default playlistSlice.reducer;

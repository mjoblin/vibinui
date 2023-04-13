import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Album, Artist, Track } from "../types";

// ================================================================================================
// Application state for holding the media groupings, as handled by useMediaGroupings() and
// <MediaGroupsManager>. This state is intended for use by whatever other components need access
// to this information.
//
// This state is not expected to change during a user session.
// ================================================================================================

export interface MediaGroupsState {
    albumById: Record<string, Album>,
    albumsByArtistName: Record<string, Album[]>,
    artistByName: Record<string, Artist>;
    trackById: Record<string, Track>;
    tracksByAlbumId: Record<string, Track[]>,
    tracksByArtistName: Record<string, Track[]>,
}

const initialState: MediaGroupsState = {
    albumById: {},
    albumsByArtistName: {},
    artistByName: {},
    trackById: {},
    tracksByAlbumId: {},
    tracksByArtistName: {},
};

export const mediaGroupsSlice = createSlice({
    name: "mediaGroups",
    initialState,
    reducers: {
        setAlbumById: (state, action: PayloadAction<Record<string, Album>>) => {
            state.albumById = action.payload;
        },
        setAlbumsByArtistName: (state, action: PayloadAction<Record<string, Album[]>>) => {
            state.albumsByArtistName = action.payload;
        },
        setArtistByName: (state, action: PayloadAction<Record<string, Artist>>) => {
            state.artistByName = action.payload;
        },
        setTrackById: (state, action: PayloadAction<Record<string, Track>>) => {
            state.trackById = action.payload;
        },
        setTracksByAlbumId: (state, action: PayloadAction<Record<string, Track[]>>) => {
            state.tracksByAlbumId = action.payload;
        },
        setTracksByArtistName: (state, action: PayloadAction<Record<string, Track[]>>) => {
            state.tracksByArtistName = action.payload;
        },
    },
});

export const {
    setAlbumById,
    setAlbumsByArtistName,
    setArtistByName,
    setTrackById,
    setTracksByAlbumId,
    setTracksByArtistName,
} = mediaGroupsSlice.actions;

export default mediaGroupsSlice.reducer;

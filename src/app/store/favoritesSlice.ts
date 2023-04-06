import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { MediaId } from "../types";
import { Favorite } from "../services/vibinFavorites";
import { updateIfDifferent } from "./helpers";

export interface FavoritesState {
    favorites: Favorite[];
    favoriteAlbumMediaIds: MediaId[];
    favoriteTrackMediaIds: MediaId[];
    haveReceivedInitialState: boolean;
}

const initialState: FavoritesState = {
    favorites: [],
    favoriteAlbumMediaIds: [],
    favoriteTrackMediaIds: [],
    haveReceivedInitialState: false,
};

export const presetsSlice = createSlice({
    name: "favorites",
    initialState,
    reducers: {
        setFavoritesState: (state, action: PayloadAction<FavoritesState>) => {
            updateIfDifferent(state, "favorites", action.payload.favorites);
            updateIfDifferent(
                state,
                "favoriteAlbumMediaIds",
                action.payload.favorites.reduce(
                    (accum, favorite) =>
                        favorite.type === "album" ? [...accum, favorite.media_id] : accum,
                    [] as MediaId[]
                )
            );
            updateIfDifferent(
                state,
                "favoriteTrackMediaIds",
                action.payload.favorites.reduce(
                    (accum, favorite) =>
                        favorite.type === "track" ? [...accum, favorite.media_id] : accum,
                    [] as MediaId[]
                )
            );

            state.haveReceivedInitialState = true;
        },
    },
});

export const { setFavoritesState } = presetsSlice.actions;

export default presetsSlice.reducer;

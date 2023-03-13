import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Album, Artist, MediaId, Track } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

export type Favorite = {
    type: "album" | "artist" | "track";
    media_id: MediaId;
    when_favorited: number;
    media: Artist | Album | Track;
};

export const vibinFavoritesApi = createApi({
    reducerPath: "vibinFavoritesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/favorites" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getFavorites: builder.query<Favorite[], void>({
            query: () => "",
        }),
        getFavoriteAlbums: builder.query<Favorite[], void>({
            query: () => "albums",
        }),
        getFavoriteTracks: builder.query<Favorite[], void>({
            query: () => "tracks",
        }),
    }),
});

export const { useGetFavoritesQuery, useGetFavoriteAlbumsQuery, useGetFavoriteTracksQuery } =
    vibinFavoritesApi;

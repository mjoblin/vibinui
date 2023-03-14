import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Album, Artist, MediaId, Track } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

export type FavoriteType = "album" | "artist" | "track";

export type Favorite = {
    type: FavoriteType;
    media_id: MediaId;
    when_favorited: number;
    media: Artist | Album | Track;
};

export const vibinFavoritesApi = createApi({
    reducerPath: "vibinFavoritesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/favorites" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        addFavorite: builder.mutation<void, { type: FavoriteType; mediaId: MediaId }>({
            query: ({ type, mediaId }) => ({
                url: "",
                method: "POST",
                body: {
                    type,
                    media_id: mediaId,
                },
            }),
        }),
        deleteFavorite: builder.mutation<void, { mediaId: MediaId }>({
            query: ({ mediaId }) => ({
                url: mediaId,
                method: "DELETE",
            }),
        }),
        getFavorites: builder.query<Record<"favorites", Favorite[]>, void>({
            query: () => "",
        }),
        getFavoriteAlbums: builder.query<Record<"favorites", Favorite[]>, void>({
            query: () => "albums",
        }),
        getFavoriteTracks: builder.query<Record<"favorites", Favorite[]>, void>({
            query: () => "tracks",
        }),
    }),
});

export const {
    useAddFavoriteMutation,
    useDeleteFavoriteMutation,
    useGetFavoritesQuery,
    useGetFavoriteAlbumsQuery,
    useGetFavoriteTracksQuery,
} = vibinFavoritesApi;

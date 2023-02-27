import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Artist, MediaId } from "../types";

export const vibinArtistsApi = createApi({
    reducerPath: "vibinArtistsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/artists" }),
    endpoints: (builder) => ({
        getArtistById: builder.query<Artist, MediaId>({
            query: (albumId) => albumId,
        }),
        getArtists: builder.query<Artist[], void>({
            query: () => "",
        }),
    }),
});

export const { useGetArtistByIdQuery, useGetArtistsQuery } = vibinArtistsApi;

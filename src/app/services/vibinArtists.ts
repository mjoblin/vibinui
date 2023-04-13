import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Artist, MediaId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /artists endpoint.
//
// Features: Retrieve Artists.
// ================================================================================================

export const vibinArtistsApi = createApi({
    reducerPath: "vibinArtistsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/artists" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
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

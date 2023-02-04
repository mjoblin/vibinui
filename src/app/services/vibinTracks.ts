import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type LyricChunk = {
    header: string | undefined;
    body: string[];
};

export type Lyrics = LyricChunk[];

export type MediaLink = {
    type: string;
    name: string;
    url: string;
};

export type MediaLinks = {
    [key: string]: MediaLink[];
};

export const vibinTracksApi = createApi({
    reducerPath: "vibinTracksApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/tracks" }),
    endpoints: (builder) => ({
        getLyrics: builder.query<Lyrics, string>({
            query: (trackId) => ({ url: `${trackId}/lyrics` }),
        }),
        getLinks: builder.query<MediaLinks, { trackId: string; allTypes?: boolean }>({
            query: ({ trackId, allTypes = false }) => ({
                url: `${trackId}/links?all_types=${allTypes}`,
            }),
        }),
    }),
});

export const { useGetLyricsQuery, useGetLinksQuery } = vibinTracksApi;

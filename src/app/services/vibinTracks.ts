import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type LyricChunk = {
    header: string | undefined;
    body: string[];
}

export type Lyrics = LyricChunk[];

export const vibinTracksApi = createApi({
    reducerPath: "vibinTracksApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/tracks" }),
    endpoints: (builder) => ({
        getLyrics: builder.query<Lyrics, string>({
            query: (trackId) => ({ url: `${trackId}/lyrics` }),
        }),
    }),
});

export const { useGetLyricsQuery } = vibinTracksApi;

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

export type WaveformFormat = "dat" | "json" | "png";

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
        // TODO: Have return type handle JSON and binary waveform data types.
        getWaveform: builder.query<
            any,
            { trackId: string; format: WaveformFormat; width?: number; height?: number }
        >({
            query: ({ trackId, format = "png", width, height }) => ({
                url: `${trackId}/waveform${
                    width || height ? `?width=${width}&height=${height}` : ""
                }`,
                headers: {
                    accept:
                        format === "json"
                            ? "application/json"
                            : format === "png"
                            ? "image/png"
                            : "application/octet-stream",
                },
                responseHandler: "content-type",
            }),
        }),
    }),
});

export const { useGetLyricsQuery, useGetLinksQuery, useGetWaveformQuery } = vibinTracksApi;

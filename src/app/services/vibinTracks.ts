import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { MediaId, Track } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";
import { BackendTrack, trackTransformer } from "./vibinAlbums";

export type LyricChunk = {
    header: string | undefined;
    body: string[];
};

export type Lyrics = {
    lyrics_id: string;
    media_id: MediaId;
    is_valid: boolean;
    chunks: LyricChunk[];
};

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
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getLyrics: builder.query<
            Lyrics,
            { trackId?: string; artist?: string; title?: string; updateCache?: boolean }
        >({
            query: ({ trackId, artist, title, updateCache = false }) => ({
                url: trackId ? `${trackId}/lyrics` : "lyrics",
                params: trackId
                    ? { update_cache: updateCache }
                    : { update_cache: updateCache, artist, title },
            }),
        }),
        getLinks: builder.query<
            MediaLinks,
            {
                trackId?: string;
                artist?: string;
                album?: string;
                title?: string;
                allTypes?: boolean;
            }
        >({
            query: ({ trackId, artist, album, title, allTypes = false }) => ({
                url: trackId ? `${trackId}/links?all_types=${allTypes}` : "links",
                params: trackId ? {} : { artist, album, title },
            }),
        }),
        getTrackById: builder.query<Track, MediaId>({
            query: (trackId) => trackId,
            transformResponse(track: BackendTrack): Promise<Track> | Track {
                return trackTransformer(track);
            },
        }),
        getTracks: builder.query<Track[], void>({
            query: () => "",
            transformResponse(tracks: BackendTrack[]): Promise<Track[]> | Track[] {
                return tracks.map(trackTransformer);
            },
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
        searchLyrics: builder.mutation<{ query: string; matches: MediaId[] }, { query: string }>({
            query: ({ query }) => ({
                url: "lyrics/search",
                method: "POST",
                body: {
                    query,
                },
            }),
        }),
        validateLyrics: builder.query<
            Lyrics,
            { trackId?: string; artist?: string; title?: string; isValid: boolean }
        >({
            query: ({ trackId, artist, title, isValid }) => ({
                url: trackId ? `${trackId}/lyrics/validate` : "lyrics/validate",
                params: trackId
                    ? { is_valid: isValid }
                    : { is_valid: isValid, artist, title },
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetLinksQuery,
    useGetLyricsQuery,
    useGetTrackByIdQuery,
    useGetTracksQuery,
    useGetWaveformQuery,
    useLazyGetLyricsQuery,
    useLazyGetTrackByIdQuery,
    useLazyValidateLyricsQuery,
    useSearchLyricsMutation,
} = vibinTracksApi;

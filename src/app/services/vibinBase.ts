import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Album, Track } from "../types";
import{ hmsToSecs } from "../utils";

type BackendTrack = {
    id: string;
    title: string;
    creator: string;
    date: string;
    artist: string;
    album: string;
    duration: string;
    genre: string;
    album_art_uri: string;
    original_track_number: string;
}

export const vibinBaseApi = createApi({
    reducerPath: "vibinBaseApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (builder) => ({
        getAlbums: builder.query<Album[], void>({
            query: () => "albums",
        }),
        getTracks: builder.query<Track[], string>({
            query: (albumMediaId) => `albums/${albumMediaId}/tracks`,
            transformResponse(tracks: BackendTrack[]): Promise<Track[]> | Track[] {
                // TODO: Figure out how to handle different-but-similar types, such as playlist
                //  entry, track, upnp browsable item, etc, and how those types differ between
                //  backend and frontend.
                return tracks.map((track: BackendTrack) => ({
                    id: track.id,
                    track_number: parseInt(track.original_track_number, 10),
                    duration: hmsToSecs(track.duration),
                    album: track.album,
                    artist: track.artist,
                    title: track.title,
                    art_url: track.album_art_uri,
                    genre: track.genre,
                }));
            }
        }),
    }),
});

export const { useGetAlbumsQuery, useGetTracksQuery, useLazyGetTracksQuery } = vibinBaseApi;

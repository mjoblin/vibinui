import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Album, Track } from "../types";
import { hmsToSecs } from "../utils";
import { MediaId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /albums endpoint.
//
// Features: Retrieve Albums.
// ================================================================================================

// TODO: Consider refactoring these multiple API slices (Albums, Playlist, etc) into a single slice.
//  https://redux-toolkit.js.org/rtk-query/api/createApi

export type BackendAlbum = {
    id: MediaId;
    title: string;
    creator: string;
    date: string;
    artist: string;
    genre: string;
    album_art_uri: string;
};

export type BackendTrack = {
    id: string;
    albumId: string;
    parentId: string;
    title: string;
    creator: string;
    date: string;
    artist: string;
    album: string;
    duration: string;
    genre: string;
    album_art_uri: string;
    original_track_number: string;
};

export const trackTransformer = (track: BackendTrack): Track => ({
    id: track.id,
    albumId: track.albumId,
    parentId: track.parentId,
    track_number: parseInt(track.original_track_number, 10),
    duration: hmsToSecs(track.duration),
    album: track.album,
    artist: track.artist,
    title: track.title,
    art_url: track.album_art_uri,
    album_art_uri: track.album_art_uri,
    date: track.date,
    genre: track.genre,
});

export const vibinAlbumsApi = createApi({
    reducerPath: "vibinAlbumsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/albums" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getAlbumById: builder.query<Album, MediaId>({
            query: (albumId) => albumId,
        }),
        getAlbums: builder.query<Album[], void>({
            query: () => "",
        }),
        getNewAlbums: builder.query<Album[], void>({
            query: () => "new",
        }),
        getAlbumTracks: builder.query<Track[], string>({
            query: (albumMediaId) => `${albumMediaId}/tracks`,
            transformResponse(tracks: BackendTrack[]): Promise<Track[]> | Track[] {
                // TODO: Figure out how to handle different-but-similar types, such as playlist
                //  entry, track, upnp browsable item, etc, and how those types differ between
                //  backend and frontend.
                return tracks.map(trackTransformer);
            },
        }),
    }),
});

export const {
    useGetAlbumByIdQuery,
    useGetAlbumsQuery,
    useGetAlbumTracksQuery,
    useGetNewAlbumsQuery,
    useLazyGetAlbumByIdQuery,
    useLazyGetAlbumTracksQuery,
} = vibinAlbumsApi;

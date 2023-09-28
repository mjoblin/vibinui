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

export const albumTransformer = (album: BackendAlbum): Album => {
    const date = new Date(album.date);
    const year = date.getFullYear();

    return {
        id: album.id,
        title: album.title,
        creator: album.artist,
        date: album.date,
        year: isNaN(year) ? 0 : year,
        artist: album.artist,
        genre: album.genre,
        album_art_uri: album.album_art_uri,
    }
};

export const trackTransformer = (track: BackendTrack): Track => {
    const date = new Date(track.date);
    const year = date.getFullYear();

    return {
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
        year: isNaN(year) ? 0 : year,
        genre: track.genre,
    }
};

export const vibinAlbumsApi = createApi({
    reducerPath: "vibinAlbumsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/albums" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getAlbumById: builder.query<Album, MediaId>({
            query: (albumId) => albumId,
            transformResponse(album: BackendAlbum): Promise<Album> | Album {
                return albumTransformer(album);
            },
        }),
        getAlbums: builder.query<Album[], void>({
            query: () => "",
            transformResponse(albums: BackendAlbum[]): Promise<Album[]> | Album[] {
                return albums.map(albumTransformer);
            },
        }),
        getNewAlbums: builder.query<Album[], void>({
            query: () => "new",
            transformResponse(albums: BackendAlbum[]): Promise<Album[]> | Album[] {
                return albums.map(albumTransformer);
            },
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

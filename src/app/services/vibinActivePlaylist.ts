import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { MediaId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /playlist endpoint.
//
// Features: Interact with the current Playlist (add entries, move entries, delete entries, play
//  entries, etc).
//
// NOTE: The current streamer Playlist is the source of truth for what is currently playing and
//  what is to be played next. Simple actions like playing an Album are actually implemented on the
//  streamer by replacing the current playlist with all the Tracks in the Album.
// ================================================================================================

/**
 * NOTE: Changes made to the playlist should result in the streamer re-announcing the new playlist
 * state, which should be received via the vibinWebsocket connection (which in turn should update
 * the application state with the new playlist details).
 */

/**
 * TODO: Determine whether both store/playlistSlice and services/vibinActivePlaylist should
 *  coexist. Perhaps everything should be managed in services/vibinActivePlaylist.
 */

type PlaylistAddMediaAction =
    | "REPLACE"  // Track or Album. Replaces the entire playlist.
    | "PLAY_NOW"  // Track or Album. Adds after the currently-playing entry, and starts playing the new entry.
    | "PLAY_NEXT"  // Track or Album. Adds after the current playlist entry, without changing what's currently playing.
    | "PLAY_FROM_HERE"  // Track only. Replaces the playlist with the track's entire Album, and plays the Track.
    | "APPEND"  // Track or Album. Adds to the end of the playlist, without changing what's currently playing.
    | "INSERT";  // Track only. Inserts into the playlist at the given index, without changing what's currently playing.
type PlaylistEntryId = number;
type PlaylistEntryIndex = number;

export const vibinActivePlaylistApi = createApi({
    reducerPath: "vibinActivePlaylistApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/active_playlist" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        addMediaToPlaylist: builder.mutation<
            void,
            { mediaId: MediaId; action?: PlaylistAddMediaAction; insertIndex?: number }
        >({
            // Note: INSERT requires an insertIndex. Only individual tracks can be inserted.
            // TODO: Consider creating insertTrackIntoPlaylist() to make this distinction clearer
            //  (at the expense of then having both an "add..." and an "insert..." way to add
            //  media to the playlist, which might feel odd as a user).
            query: ({ mediaId, action = "REPLACE", insertIndex }) => ({
                url: `modify/${mediaId}?action=${action}${
                    action === "INSERT" ? `insert_index=${insertIndex}` : ""
                }`,
                method: "POST",
            }),
        }),
        clearPlaylist: builder.mutation<void, void>({
            query: () => ({
                url: "clear",
                method: "POST",
            }),
        }),
        deletePlaylistEntryId: builder.mutation<void, { playlistId: PlaylistEntryId }>({
            query: ({ playlistId }) => ({
                url: `delete/${playlistId}`,
                method: "POST",
            }),
        }),
        movePlaylistEntryId: builder.mutation<
            void,
            {
                playlistId: PlaylistEntryId;
                fromIndex: PlaylistEntryIndex;
                toIndex: PlaylistEntryIndex;
            }
        >({
            query: ({ playlistId, fromIndex, toIndex }) => ({
                url: `move/${playlistId}?from_index=${fromIndex}&to_index=${toIndex}`,
                method: "POST",
            }),
        }),
        playFavoriteAlbums: builder.mutation<void, { maxCount?: number }>({
            query: ({ maxCount }) => ({
                url: "play/favorites/albums",
                method: "POST",
                params: maxCount ? { max_count: maxCount } : {},
            }),
        }),
        playFavoriteTracks: builder.mutation<void, { maxCount?: number }>({
            query: ({ maxCount }) => ({
                url: "play/favorites/tracks",
                method: "POST",
                params: maxCount ? { max_count: maxCount } : {},
            }),
        }),
        playPlaylistEntryId: builder.mutation<void, { playlistId: PlaylistEntryId }>({
            query: ({ playlistId }) => ({
                url: `play/id/${playlistId}`,
                method: "POST",
            }),
        }),
        playPlaylistEntryIndex: builder.mutation<void, { playlistIndex: PlaylistEntryIndex }>({
            query: ({ playlistIndex }) => ({
                url: `play/index/${playlistIndex}`,
                method: "POST",
            }),
        }),
        setPlaylistMediaIds: builder.mutation<void, { mediaIds: MediaId[], maxCount?: number }>({
            query: ({ mediaIds, maxCount = 10 }) => ({
                url: `modify`,
                method: "POST",
                body: {
                    action: "REPLACE",
                    max_count: maxCount,
                    media_ids: mediaIds,
                },
            }),
        }),
    }),
});

// TODO: Consider using Query not Mutation (as a naming convention)

export const {
    useAddMediaToPlaylistMutation,
    useClearPlaylistMutation,
    useDeletePlaylistEntryIdMutation,
    useMovePlaylistEntryIdMutation,
    usePlayFavoriteAlbumsMutation,
    usePlayFavoriteTracksMutation,
    usePlayPlaylistEntryIdMutation,
    usePlayPlaylistEntryIndexMutation,
    useSetPlaylistMediaIdsMutation,
} = vibinActivePlaylistApi;

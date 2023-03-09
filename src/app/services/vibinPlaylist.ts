import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { MediaId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

/**
 * NOTE: Changes made to the playlist should result in the streamer re-announcing the new playlist
 * state, which should be received via the vibinWebsocket connection (which in turn should update
 * the application state with the new playlist details).
 */

/**
 * TODO: Determine whether both store/playlistSlice and services/vibinPlaylist should coexists.
 *  Perhaps everything should be managed in services/vibinPlaylist.
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

export const vibinPlaylistApi = createApi({
    reducerPath: "vibinPlaylistApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/playlist" }),
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
                url: `clear`,
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
    }),
});

export const {
    useAddMediaToPlaylistMutation,
    useClearPlaylistMutation,
    useDeletePlaylistEntryIdMutation,
    useMovePlaylistEntryIdMutation,
    usePlayPlaylistEntryIdMutation,
    usePlayPlaylistEntryIndexMutation,
} = vibinPlaylistApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { MediaId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /queue endpoint.
//
// Features: Interact with the current Queue (add entries, move entries, delete entries, play
//  entries, etc).
//
// NOTE: The current streamer Queue is the source of truth for what is currently playing and what
//  is to be played next. Simple actions like playing an Album are actually implemented on the
//  streamer by replacing the current Queue with all the Tracks in the Album.
// ================================================================================================

/**
 * NOTE: Changes made to the Queue should result in the streamer re-announcing the new Queue state,
 * which should be received via the vibinWebsocket connection (which in turn should update
 * the application state with the new Queue details).
 */

type QueueAddMediaAction =
    | "REPLACE" // Track or Album. Replaces the entire playlist.
    | "PLAY_NOW" // Track or Album. Adds after the currently-playing entry, and starts playing the new entry.
    | "PLAY_NEXT" // Track or Album. Adds after the current playlist entry, without changing what's currently playing.
    | "PLAY_FROM_HERE" // Track only. Replaces the playlist with the track's entire Album, and plays the Track.
    | "APPEND" // Track or Album. Adds to the end of the playlist, without changing what's currently playing.
    | "INSERT"; // Track only. Inserts into the playlist at the given index, without changing what's currently playing.
type QueueItemId = number;
type QueueItemPosition = number;

export const vibinQueueApi = createApi({
    reducerPath: "vibinQueueApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/queue" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        addMediaToQueue: builder.mutation<
            void,
            { mediaId: MediaId; action?: QueueAddMediaAction; insertIndex?: number }
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
        clearQueue: builder.mutation<void, void>({
            query: () => ({
                url: "clear",
                method: "POST",
            }),
        }),
        deleteQueueItemId: builder.mutation<void, { itemId: QueueItemId }>({
            query: ({ itemId }) => ({
                url: `delete/${itemId}`,
                method: "POST",
            }),
        }),
        moveQueueItemId: builder.mutation<
            void,
            {
                itemId: QueueItemId;
                fromPosition: QueueItemPosition;
                toPosition: QueueItemPosition;
            }
        >({
            query: ({ itemId, fromPosition, toPosition }) => ({
                url: `move/${itemId}?from_position=${fromPosition}&to_position=${toPosition}`,
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
        playQueueItemId: builder.mutation<void, { itemId: QueueItemId }>({
            query: ({ itemId }) => ({
                url: `play/id/${itemId}`,
                method: "POST",
            }),
        }),
        playQueueItemPosition: builder.mutation<void, { itemPosition: QueueItemPosition }>({
            query: ({ itemPosition }) => ({
                url: `play/position/${itemPosition}`,
                method: "POST",
            }),
        }),
        setPlaylistMediaIds: builder.mutation<void, { mediaIds: MediaId[]; maxCount?: number }>({
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
    useAddMediaToQueueMutation,
    useClearQueueMutation,
    useDeleteQueueItemIdMutation,
    useMoveQueueItemIdMutation,
    usePlayFavoriteAlbumsMutation,
    usePlayFavoriteTracksMutation,
    usePlayQueueItemIdMutation,
    usePlayQueueItemPositionMutation,
    useSetPlaylistMediaIdsMutation,
} = vibinQueueApi;

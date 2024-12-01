import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { MediaId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /playlists endpoint.
//
// Features: Retrieve, store, update, and activate Stored Playlists.
// ================================================================================================

export type StoredPlaylistId = string;

export type StoredPlaylist = {
    id: StoredPlaylistId;
    name: string;
    created: number;
    updated: number;
    entry_ids: MediaId[];
};

export const vibinStoredPlaylistsApi = createApi({
    reducerPath: "vibinStoredPlaylistsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/stored_playlists" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getStoredPlaylists: builder.query<StoredPlaylist[], void>({
            query: () => ({
                url: "",
            }),
        }),
        getStoredPlaylist: builder.query<StoredPlaylist, StoredPlaylistId>({
            query: (storedPlaylistId: StoredPlaylistId) => ({
                url: storedPlaylistId,
            }),
        }),
        updateStoredPlaylistName: builder.query<
            StoredPlaylist,
            { storedPlaylistId: StoredPlaylistId; name: string }
        >({
            query: ({ storedPlaylistId, name }) => ({
                url: storedPlaylistId,
                method: "PUT",
                params: {
                    name,
                },
            }),
        }),
        deleteStoredPlaylist: builder.query<void, StoredPlaylistId>({
            query: (storedPlaylistId: StoredPlaylistId) => ({
                url: storedPlaylistId,
                method: "DELETE",
            }),
        }),
        storeCurrentPlaylist: builder.query<StoredPlaylist, { name?: string; replace?: boolean }>({
            query: ({ name, replace }) => ({
                url: "current/store",
                method: "POST",
                params: {
                    name,
                    replace,
                },
            }),
        }),
        activateStoredPlaylist: builder.query<StoredPlaylist, StoredPlaylistId>({
            query: (storedPlaylistId) => ({
                url: `${storedPlaylistId}/make_current`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetStoredPlaylistsQuery,
    useGetStoredPlaylistQuery,
    useLazyUpdateStoredPlaylistNameQuery,
    useLazyDeleteStoredPlaylistQuery,
    useLazyStoreCurrentPlaylistQuery,
    useLazyActivateStoredPlaylistQuery,
} = vibinStoredPlaylistsApi;

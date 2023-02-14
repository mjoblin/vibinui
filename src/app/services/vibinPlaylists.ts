import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { MediaId } from "../types";

export type StoredPlaylistId = string;

export type StoredPlaylist = {
    id: StoredPlaylistId;
    name: string;
    created: number;
    updated: number;
    entry_ids: MediaId[];
}

export const vibinPlaylistsApi = createApi({
    reducerPath: "vibinPlaylistsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/playlists" }),
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
        enableStoredPlaylist: builder.query<StoredPlaylist, StoredPlaylistId>({
            query: ( storedPlaylistId ) => ({
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
    useLazyEnableStoredPlaylistQuery,
} = vibinPlaylistsApi;

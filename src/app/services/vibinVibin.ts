import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /vibin endpoint.
//
// Features: Clear the backend's media caches.
// ================================================================================================

export type VibinSettings = {
    all_albums_path: string;
    new_albums_path: string;
    all_artists_path: string;
};

export const vibinVibinApi = createApi({
    reducerPath: "vibinVibinApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/vibin" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        clearMediaCaches: builder.query<void, void>({
            query: () => ({ url: "clear_media_caches", method: "POST" }),
        }),
        settings: builder.query<VibinSettings, void>({
            query: () => ({ url: "settings" }),
        }),
        updateSettings: builder.query<VibinSettings, VibinSettings>({
            query: (settings) => ({ url: "settings", method: "PUT", body: settings }),
        }),
    }),
});

export const { useLazyClearMediaCachesQuery, useLazySettingsQuery, useLazyUpdateSettingsQuery } =
    vibinVibinApi;

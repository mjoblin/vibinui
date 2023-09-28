import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Preset, PresetId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /presets endpoint.
//
// Features: Retrieve and play Presets.
// ================================================================================================

export const vibinPresetsApi = createApi({
    reducerPath: "vibinPresetsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/presets" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getPresets: builder.query<Preset[], void>({
            query: () => ({ url: "" }),
        }),
        playPresetId: builder.query<void, PresetId>({
            query: (presetId) => ({ url: `${presetId}/play`, method: "POST" }),
        }),
    }),
});

export const { useGetPresetsQuery, useLazyPlayPresetIdQuery } = vibinPresetsApi;

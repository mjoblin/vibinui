import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { MediaId, Preset, PresetId } from "../types";
import { API_REFRESH_INTERVAL } from "../constants";

// ================================================================================================
// Interact with the vibin backend's /presets endpoint.
//
// Features: Retrieve, add, delete, and play Presets.
// ================================================================================================

export const vibinPresetsApi = createApi({
    reducerPath: "vibinPresetsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/presets" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        getPresets: builder.query<Preset[], void>({
            query: () => ({ url: "" }),
        }),
        addPreset: builder.mutation<void, { presetId: PresetId; mediaId: MediaId }>({
            query: ({ presetId, mediaId }) => ({
                url: `${presetId}`,
                method: "PUT",
                params: { media_id: mediaId },
            }),
        }),
        deletePreset: builder.mutation<void, { presetId: PresetId }>({
            query: ({ presetId }) => ({
                url: `${presetId}`,
                method: "DELETE",
            }),
        }),
        movePreset: builder.mutation<void, { fromId: PresetId; toId: PresetId }>({
            query: ({ fromId, toId }) => ({
                url: `${fromId}/move/${toId}`,
                method: "POST",
            }),
        }),
        playPresetId: builder.query<void, PresetId>({
            query: (presetId) => ({ url: `${presetId}/play`, method: "POST" }),
        }),
    }),
});

export const {
    useGetPresetsQuery,
    useAddPresetMutation,
    useDeletePresetMutation,
    useLazyPlayPresetIdQuery,
    useMovePresetMutation,
} = vibinPresetsApi;

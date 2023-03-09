import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_REFRESH_INTERVAL } from "../constants";

export type PresetId = number;

export type PresetType = "Radio" | "UPnP";

export type Preset = {
    id: PresetId;
    name: string;
    type: PresetType;
    class: string;
    state: string;
    is_playing: boolean;
    art_url: string;
};

export const vibinPresetsApi = createApi({
    reducerPath: "vibinPresetsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/presets" }),
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

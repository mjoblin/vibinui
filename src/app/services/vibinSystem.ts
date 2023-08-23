import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_REFRESH_INTERVAL } from "../constants";
import { MuteState, PowerState } from "../store/systemSlice";

// ================================================================================================
// Interact with the vibin backend's /system endpoint.
//
// Features: Toggle power on/off, set media source.
// ================================================================================================

export const vibinSystemApi = createApi({
    reducerPath: "vibinSystemApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/system" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        amplifierMuteSet: builder.query<void, { mute: MuteState }>({
            query: ({ mute }) => ({ url: `amplifier/mute/${mute}`, method: "POST" }),
        }),
        amplifierMuteToggle: builder.query<void, void>({
            query: () => ({ url: `amplifier/mute/toggle`, method: "POST" }),
        }),
        amplifierPowerSet: builder.query<void, { power: PowerState }>({
            query: ({ power }) => ({ url: `amplifier/power/${power}`, method: "POST" }),
        }),
        amplifierPowerToggle: builder.query<void, void>({
            query: () => ({ url: "amplifier/power/toggle", method: "POST" }),
        }),
        amplifierVolumeSet: builder.query<void, { volume: number }>({
            query: ({ volume }) => ({ url: `amplifier/volume/${volume}`, method: "POST" }),
        }),
        amplifierSourceSet: builder.query<void, { sourceName: string }>({
            query: ({ sourceName }) => ({ url: `amplifier/audio_source/${sourceName}`, method: "POST" }),
        }),
        streamerPowerSet: builder.query<void, { power: PowerState }>({
            query: ({ power }) => ({ url: `streamer/power/${power}`, method: "POST" }),
        }),
        streamerPowerToggle: builder.query<void, void>({
            query: () => ({ url: "streamer/power/toggle", method: "POST" }),
        }),
        streamerSourceSet: builder.query<void, { sourceName: string }>({
            query: ({ sourceName }) => ({ url: `streamer/audio_source/${sourceName}`, method: "POST" }),
        }),
    }),
});

export const {
    useLazyAmplifierMuteSetQuery,
    useLazyAmplifierMuteToggleQuery,
    useLazyAmplifierPowerSetQuery,
    useLazyAmplifierPowerToggleQuery,
    useLazyAmplifierVolumeSetQuery,
    useLazyAmplifierSourceSetQuery,
    useLazyStreamerPowerSetQuery,
    useLazyStreamerPowerToggleQuery,
    useLazyStreamerSourceSetQuery,
} = vibinSystemApi;

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
    baseQuery: fetchBaseQuery({ baseUrl: "/api/system" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        amplifierMuteSet: builder.mutation<void, MuteState>({
            query: (mute) => ({ url: `amplifier/mute/${mute}`, method: "POST" }),
        }),
        amplifierMuteToggle: builder.mutation<void, void>({
            query: () => ({ url: `amplifier/mute/toggle`, method: "POST" }),
        }),
        amplifierPowerSet: builder.mutation<void, PowerState>({
            query: (power) => ({ url: `amplifier/power/${power}`, method: "POST" }),
        }),
        amplifierPowerToggle: builder.mutation<void, void>({
            query: () => ({ url: "amplifier/power/toggle", method: "POST" }),
        }),
        amplifierVolumeDown: builder.mutation<void, void>({
            query: () => ({ url: `amplifier/volume/down`, method: "POST" }),
        }),
        amplifierVolumeSet: builder.mutation<void, number>({
            query: (volume) => ({ url: `amplifier/volume/${volume}`, method: "POST" }),
        }),
        amplifierVolumeUp: builder.mutation<void, void>({
            query: () => ({ url: `amplifier/volume/up`, method: "POST" }),
        }),
        amplifierSourceSet: builder.mutation<void, string>({
            query: (sourceName) => ({
                url: `amplifier/audio_source/${sourceName}`,
                method: "POST",
            }),
        }),
        streamerPowerSet: builder.mutation<void, PowerState>({
            query: (power) => ({ url: `streamer/power/${power}`, method: "POST" }),
        }),
        streamerPowerToggle: builder.mutation<void, void>({
            query: () => ({ url: "streamer/power/toggle", method: "POST" }),
        }),
        streamerSourceSet: builder.mutation<void, string>({
            query: (sourceName) => ({ url: `streamer/audio_source/${sourceName}`, method: "POST" }),
        }),
        systemPowerSet: builder.mutation<void, PowerState>({
            query: (power) => ({ url: `power/${power}`, method: "POST" }),
        }),
    }),
});

export const {
    useAmplifierMuteSetMutation,
    useAmplifierMuteToggleMutation,
    useAmplifierPowerSetMutation,
    useAmplifierPowerToggleMutation,
    useAmplifierVolumeDownMutation,
    useAmplifierVolumeSetMutation,
    useAmplifierVolumeUpMutation,
    useAmplifierSourceSetMutation,
    useStreamerPowerSetMutation,
    useStreamerPowerToggleMutation,
    useStreamerSourceSetMutation,
    useSystemPowerSetMutation,
} = vibinSystemApi;

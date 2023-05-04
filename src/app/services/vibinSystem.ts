import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_REFRESH_INTERVAL } from "../constants";

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
        powerToggle: builder.query<void, void>({
            query: () => ({ url: "streamer/power_toggle", method: "POST" }),
        }),
        setSource: builder.query<void, string>({
            query: (source) => ({ url: "streamer/source", method: "POST", params: { source } }),
        }),
    }),
});

export const { useLazyPowerToggleQuery, useLazySetSourceQuery } = vibinSystemApi;

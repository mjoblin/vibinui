import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_REFRESH_INTERVAL } from "../constants";

export const vibinSystemApi = createApi({
    reducerPath: "vibinSystemApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/system" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        powerToggle: builder.query<void, void>({
            query: () => ({ url: "power/toggle", method: "POST" }),
        }),
    }),
});

export const { useLazyPowerToggleQuery } = vibinSystemApi;

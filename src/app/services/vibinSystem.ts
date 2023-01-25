import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vibinSystemApi = createApi({
    reducerPath: "vibinSystemApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/system" }),
    endpoints: (builder) => ({
        powerToggle: builder.query<void, void>({
            query: () => ({ url: "power/toggle", method: "POST" }),
        }),
    }),
});

export const { useLazyPowerToggleQuery } = vibinSystemApi;

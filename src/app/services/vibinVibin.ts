import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_REFRESH_INTERVAL } from "../constants";

export const vibinVibinApi = createApi({
    reducerPath: "vibinVibinApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/vibin" }),
    keepUnusedDataFor: API_REFRESH_INTERVAL,
    endpoints: (builder) => ({
        clearMediaCaches: builder.query<void, void>({
            query: () => ({ url: "clear_media_caches", method: "POST" }),
        }),
    }),
});

export const { useLazyClearMediaCachesQuery } = vibinVibinApi;

// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Album } from "./types";

// Define a service using a base URL and expected endpoints
export const vibinApi = createApi({
    reducerPath: "vibinApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (builder) => ({
        getAlbums: builder.query<Album[], string>({
            query: () => "albums",
        }),
    }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAlbumsQuery } = vibinApi;

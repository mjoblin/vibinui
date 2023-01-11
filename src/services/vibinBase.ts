import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Album } from "../app/types";

export const vibinBaseApi = createApi({
    reducerPath: "vibinBaseApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (builder) => ({
        getAlbums: builder.query<Album[], void>({
            query: () => "albums",
        }),
    }),
});

export const { useGetAlbumsQuery } = vibinBaseApi;

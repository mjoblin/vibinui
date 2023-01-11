import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { MediaId } from "../app/types";

export const vibinTransportApi = createApi({
    reducerPath: "vibinTransportApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/transport" }),
    endpoints: (builder) => ({
        nextTrack: builder.mutation<void, void>({
            query: () => ({ url: "next", method: "POST" }),
        }),
        previousTrack: builder.mutation<void, void>({
            query: () => ({ url: "previous", method: "POST" }),
        }),
        pause: builder.mutation<void, void>({
            query: () => ({ url: "pause", method: "POST" }),
        }),
        play: builder.mutation<void, void | MediaId>({
            query: (arg) => ({ url: arg ? `play/${arg}` : "play", method: "POST" }),
        }),
    }),
});

export const { useNextTrackMutation, usePreviousTrackMutation, usePauseMutation, usePlayMutation } =
    vibinTransportApi;

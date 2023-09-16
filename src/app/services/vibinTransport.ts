import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { MediaId } from "../types";

// ================================================================================================
// Interact with the vibin backend's /transport endpoint.
//
// Features: Next track, previous track, pause, play, repeat, shuffle, etc.
// ================================================================================================

// Playhead seek target.
//
// float: 0.0 -> 1.0 (for beginning -> end of track; 0.5 is half way into track)
// int: Number of seconds into the track
// string: "h:mm:ss" into the track
type SeekTarget = number | string;

export const vibinTransportApi = createApi({
    reducerPath: "vibinTransportApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/transport" }),
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
        seek: builder.mutation<void, SeekTarget>({
            query: (seekTarget) => ({ url: `seek?target=${seekTarget}`, method: "POST" }),
        }),
        stop: builder.mutation<void, void>({
            query: () => ({ url: "stop", method: "POST" }),
        }),
        togglePlayback: builder.mutation<boolean, void>({
            query: () => ({ url: `toggle_playback`, method: "POST" }),
        }),
        toggleRepeat: builder.mutation<boolean, void>({
            query: () => ({ url: `repeat`, method: "POST" }),
        }),
        toggleShuffle: builder.mutation<boolean, void>({
            query: () => ({ url: `shuffle`, method: "POST" }),
        }),
    }),
});

export const {
    useNextTrackMutation,
    usePreviousTrackMutation,
    usePauseMutation,
    usePlayMutation,
    useSeekMutation,
    useStopMutation,
    useTogglePlaybackMutation,
    useToggleRepeatMutation,
    useToggleShuffleMutation,
} = vibinTransportApi;

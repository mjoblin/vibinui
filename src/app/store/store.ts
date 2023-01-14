import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import playbackReducer from "./playbackSlice";
import playlistReducer from "./playlistSlice";
import { vibinBaseApi } from "../services/vibinBase";
import { vibinTransportApi } from "../services/vibinTransport";
import { vibinWebsocket } from "../services/vibinWebsocket";

export const store = configureStore({
    reducer: {
        playback: playbackReducer,
        playlist: playlistReducer,
        [vibinBaseApi.reducerPath]: vibinBaseApi.reducer,
        [vibinTransportApi.reducerPath]: vibinTransportApi.reducer,
        [vibinWebsocket.reducerPath]: vibinWebsocket.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            vibinBaseApi.middleware,
            vibinTransportApi.middleware,
            vibinWebsocket.middleware
        ),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import playbackReducer from "../features/playback/playbackSlice";
import playlistReducer from "../features/playlist/playlistSlice";
import { vibinApi } from "../services/vibin";
import { vibinWebsocket } from "../services/vibinWebsocket";

export const store = configureStore({
    reducer: {
        playback: playbackReducer,
        playlist: playlistReducer,
        [vibinApi.reducerPath]: vibinApi.reducer,
        [vibinWebsocket.reducerPath]: vibinWebsocket.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            vibinApi.middleware,
            vibinWebsocket.middleware,
        ),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

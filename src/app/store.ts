import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import albumsReducer from "../features/albums/albumsSlice";
import playbackReducer from "../features/playback/playbackSlice";
import { vibinApi } from "../services/vibin";
import { vibinWebsocket } from "../services/vibinWebsocket";

export const store = configureStore({
    reducer: {
        albums: albumsReducer,
        playback: playbackReducer,
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

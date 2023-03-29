import React, { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { RootState } from "./app/store/store";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { setApplicationTheme } from "./app/store/userSettingsSlice";
import { useAppGlobals } from "./app/hooks/useAppGlobals";
import RootLayout from "./components/layout/RootLayout";
import AlbumsScreen from "./components/layout/AlbumsScreen";
import ArtistsScreen from "./components/layout/ArtistsScreen";
import FavoritesScreen from "./components/layout/FavoritesScreen";
import NowPlayingScreen from "./components/layout/NowPlayingScreen";
import PresetsScreen from "./components/layout/PresetsScreen";
import PlaylistScreen from "./components/layout/PlaylistScreen";
import PlayheadManager from "./components/managers/PlayheadManager";
import MediaGroupsManager from "./components/managers/MediaGroupsManager";
import MediaSourceManager from "./components/managers/MediaSourceManager";
import TracksScreen from "./components/layout/TracksScreen";
import WebsocketManager from "./components/managers/WebsocketManager";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import StatusScreen from "./components/layout/StatusScreen";

export default function App() {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state: RootState) => state.userSettings.application);
    const { APP_ALT_FONTFACE, APP_URL_PREFIX } = useAppGlobals();
    const [colorScheme, setColorScheme] = useState<ColorScheme>(theme);

    const toggleColorScheme = (value?: ColorScheme) => {
        const newTheme = value || (colorScheme === "dark" ? "light" : "dark");

        setColorScheme(newTheme);
        dispatch(setApplicationTheme(newTheme));
    };

    const router = createBrowserRouter([
        {
            path: APP_URL_PREFIX,
            element: <RootLayout />,
            errorElement: <ErrorBoundary />,
            children: [
                {
                    path: "current",
                    element: <NowPlayingScreen />,
                },
                {
                    path: "playlist",
                    element: <PlaylistScreen />,
                },
                {
                    path: "artists",
                    element: <ArtistsScreen />,
                },
                {
                    path: "albums",
                    element: <AlbumsScreen />,
                },
                {
                    path: "tracks",
                    element: <TracksScreen />,
                },
                {
                    path: "presets",
                    element: <PresetsScreen />,
                },
                {
                    path: "favorites",
                    element: <FavoritesScreen />,
                },
                {
                    path: "status",
                    element: <StatusScreen />,
                },
                {
                    path: "*",
                    element: <Navigate to="/ui/albums" replace />,
                },
                {
                    index: true,
                    element: <Navigate to="/ui/albums" replace />,
                },
            ],
        },
    ]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme,
                    components: {
                        Tooltip: {
                            defaultProps: {
                                color: "blue",
                                openDelay: 500,
                                withArrow: true,
                                arrowSize: 8,
                                styles: { tooltip: { fontSize: 12 } },
                            },
                        },
                        Modal: {
                            styles: {
                                header: {
                                    fontWeight: "bold",
                                    fontFamily: APP_ALT_FONTFACE,
                                    textTransform: "uppercase",
                                },
                            },
                        },
                    },
                }}
            >
                <Notifications limit={5} autoClose={3000} />
                <WebsocketManager />
                <PlayheadManager />
                <MediaGroupsManager />
                <MediaSourceManager />
                <RouterProvider router={router} />
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

import React, { useEffect, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { RootState } from "./app/store/store";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { setApplicationTheme } from "./app/store/userSettingsSlice";
import { useAppConstants } from "./app/hooks/useAppConstants";
import RootLayout from "./components/layout/RootLayout";
import AlbumsScreen from "./components/layout/AlbumsScreen";
import ArtistsScreen from "./components/layout/ArtistsScreen";
import NowPlayingScreen from "./components/layout/NowPlayingScreen";
import PresetsScreen from "./components/layout/PresetsScreen";
import PlaylistScreen from "./components/layout/PlaylistScreen";
import PlayheadManager from "./components/managers/PlayheadManager";
import TracksScreen from "./components/layout/TracksScreen";
import WebsocketManager from "./components/managers/WebsocketManager";
import ErrorBoundary from "./components/shared/ErrorBoundary";

export default function App() {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state: RootState) => state.userSettings.application);
    const { APP_URL_PREFIX } = useAppConstants();
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
                    path: "playlists",
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
                                    fontSize: 14,
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

                {/* TODO: Fix this; prevent constant <style> tags being added to <head> */}
                <RouterProvider router={router} />
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

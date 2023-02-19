import React, { useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

import { RootState } from "./app/store/store";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { setApplicationTheme } from "./app/store/userSettingsSlice";
import BrowseScreen from "./components/layout/BrowseScreen";
import NowPlayingScreen from "./components/layout/NowPlayingScreen";
import RootLayout from "./components/layout/RootLayout";
import PlaylistScreen from "./components/layout/PlaylistScreen";
import PlayheadManager from "./components/managers/PlayheadManager";
import WebsocketManager from "./components/managers/WebsocketManager";

export default function App() {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state: RootState) => state.userSettings.application);
    const [colorScheme, setColorScheme] = useState<ColorScheme>(theme);

    const toggleColorScheme = (value?: ColorScheme) => {
        const newTheme = value || (colorScheme === "dark" ? "light" : "dark");

        setColorScheme(newTheme);
        dispatch(setApplicationTheme(newTheme));
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: <RootLayout />,
            children: [
                {
                    path: "browse",
                    element: <BrowseScreen />,
                },
                {
                    path: "playlist",
                    element: <PlaylistScreen />,
                },
                {
                    path: "playing",
                    element: <NowPlayingScreen />,
                },
                {
                    index: true,
                    element: <Navigate to="/browse" replace />,
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
                <NotificationsProvider limit={5} autoClose={3000}>
                    <WebsocketManager />
                    <PlayheadManager />

                    {/* TODO: Fix this; prevent constant <style> tags being added to <head> */}
                    <RouterProvider router={router} />
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

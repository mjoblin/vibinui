import React, { useState } from "react";
import { Provider } from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";

import { store } from "./app/store/store";
import BrowseScreen from "./components/layout/BrowseScreen";
import CurrentlyPlayingScreen from "./components/layout/CurrentlyPlayingScreen";
import RootLayout from "./components/layout/RootLayout";
import PlaylistScreen from "./components/layout/PlaylistScreen";
import PlayheadManager from "./components/managers/PlayheadManager";
import WebsocketManager from "./components/managers/WebsocketManager";

export default function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    return (
        <Provider store={store}>
            <BrowserRouter>
                <ColorSchemeProvider
                    colorScheme={colorScheme}
                    toggleColorScheme={toggleColorScheme}
                >
                    <MantineProvider
                        theme={{ colorScheme, loader: "dots" }}
                        withGlobalStyles
                        withNormalizeCSS
                    >
                        <WebsocketManager />
                        <PlayheadManager />

                        <Routes>
                            <Route path="/" element={<RootLayout />}>
                                <Route path="browse" element={<BrowseScreen />} />
                                <Route path="playlist" element={<PlaylistScreen />} />
                                <Route path="current" element={<CurrentlyPlayingScreen />} />
                            </Route>
                        </Routes>
                    </MantineProvider>
                </ColorSchemeProvider>
            </BrowserRouter>
        </Provider>
    );
}

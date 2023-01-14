import React, { useState } from "react";
import { Provider } from "react-redux";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";

import { store } from "./app/store/store";
import RootLayout from "./components/layout/RootLayout";

export default function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    return (
        <Provider store={store}>
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                <MantineProvider
                    theme={{ colorScheme, loader: "dots" }}
                    withGlobalStyles
                    withNormalizeCSS
                >
                    <RootLayout />
                </MantineProvider>
            </ColorSchemeProvider>
        </Provider>
    );
}

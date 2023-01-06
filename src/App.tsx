import { MantineProvider, Text } from "@mantine/core";
import { Albums } from "./features/albums/Albums";
import { WebsocketRaw } from "./features/WebsocketRaw";

import "./App.css";

export default function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <div className="App">
                <Albums />
                <WebsocketRaw />
            </div>
        </MantineProvider>
    );
}

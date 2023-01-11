import { MantineProvider, Text } from "@mantine/core";
import { Albums } from "./features/albums/Albums";
import { Playback } from "./features/playback/Playback";
import { PlayheadManager } from "./features/app/PlayheadManager";
import { WebsocketRaw } from "./features/WebsocketRaw";

import "./App.css";

export default function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <div className="App">
                <PlayheadManager />
                <Playback />
                <Albums />
                <WebsocketRaw />
            </div>
        </MantineProvider>
    );
}

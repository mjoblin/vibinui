import { MantineProvider, Text } from "@mantine/core";
import { Albums } from "./features/albums/Albums";
import { Playback } from "./features/playback/Playback";
import { WebsocketRaw } from "./features/WebsocketRaw";

import { useGetMessagesQuery } from "./services/vibinWebsocket";

import "./App.css";

export default function App() {
    const { data, error, isLoading } = useGetMessagesQuery();

    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <div className="App">
                <Playback />
                <Albums />
                <WebsocketRaw />
            </div>
        </MantineProvider>
    );
}

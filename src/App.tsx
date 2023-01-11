import { MantineProvider } from "@mantine/core";

import { Albums } from "./features/albums/Albums";
import { PlayheadManager } from "./features/app/PlayheadManager";
import { WebsocketManager } from "./features/app/WebsocketManager";
import { Format } from "./features/format/Format";
import { Playback } from "./features/playback/Playback";
import { PlaybackStatus } from "./features/playbackStatus/PlaybackStatus";
import { Stream } from "./features/stream/Stream";
import { Track } from "./features/track/Track";

import "./App.css";

export default function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <div className="App">
                <PlayheadManager />
                <WebsocketManager />

                <Playback />
                <Albums />
                <div style={{display: "flex", gap: "10px", flexDirection: "column"}}>
                    <Track />
                    <Format />
                    <Stream />
                    <PlaybackStatus />
                </div>
            </div>
        </MantineProvider>
    );
}

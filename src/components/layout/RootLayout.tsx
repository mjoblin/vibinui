import React, { FC } from "react";
import { Checkbox, useMantineColorScheme } from "@mantine/core";

import Albums from "../albums/Albums";
import PlayheadManager from "../managers/PlayheadManager";
import WebsocketManager from "../managers/WebsocketManager";
import Format from "../format/Format";
import Playback from "../playback/Playback";
import PlaybackStatus from "../playbackStatus/PlaybackStatus";
import Playlist from "../playlist/Playlist";
import Stream from "../stream/Stream";
import Track from "../track/Track";

import "./RootLayout.css";

const RootLayout: FC = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const isDark = colorScheme === "dark";

    return (
        <div className="RootLayout">
            <PlayheadManager />
            <WebsocketManager />

            <Playback />
            <Checkbox checked={isDark} label={`Scheme (${colorScheme})`} onClick={() => toggleColorScheme()} />
            <Albums />
            <Playlist />
            <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <Track />
                <Format />
                <Stream />
                <PlaybackStatus />
            </div>
        </div>
    );
}

export default RootLayout;

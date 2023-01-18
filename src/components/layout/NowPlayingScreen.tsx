import React, { FC } from "react";

import { Space } from "@mantine/core";

import NowPlaying from "../currentlyPlaying/NowPlaying";
import Track from "../track/Track";
import Playback from "../playback/Playback";
import PlaybackStatus from "../playbackStatus/PlaybackStatus";
import Format from "../format/Format";
import Stream from "../stream/Stream";

const NowPlayingScreen: FC = () => {
        return (
        <>
            <Track />
            <NowPlaying />

            <Space />

            <Track />
            <Playback />
            <PlaybackStatus />
            <Format />
            <Stream />
        </>
    );
}

export default NowPlayingScreen;

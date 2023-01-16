import React, { FC } from "react";

import { Space } from "@mantine/core";

import CurrentlyPlaying from "../currentlyPlaying/CurrentlyPlaying";
import Track from "../track/Track";
import Playback from "../playback/Playback";
import PlaybackStatus from "../playbackStatus/PlaybackStatus";
import Format from "../format/Format";
import Stream from "../stream/Stream";

const CurrentlyPlayingScreen: FC = () => {
        return (
        <>
            <Track />
            <CurrentlyPlaying />

            <Space />

            <Track />
            <Playback />
            <PlaybackStatus />
            <Format />
            <Stream />
        </>
    );
}

export default CurrentlyPlayingScreen;

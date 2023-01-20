import React, { FC } from "react";

import { Space } from "@mantine/core";

import NowPlaying from "../currentlyPlaying/NowPlaying";
import TrackDel from "../tracks/TrackDel";
import Playback from "../playback/Playback";
import PlaybackStatus from "../playbackStatus/PlaybackStatus";
import Format from "../format/Format";
import Stream from "../stream/Stream";

const NowPlayingScreen: FC = () => {
        return (
        <>
            <TrackDel />
            <NowPlaying />

            <Space />

            <TrackDel />
            <Playback />
            <PlaybackStatus />
            <Format />
            <Stream />
        </>
    );
}

export default NowPlayingScreen;

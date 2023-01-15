import React, { FC } from "react";

import Track from "../track/Track";
import Playback from "../playback/Playback";
import PlaybackStatus from "../playbackStatus/PlaybackStatus";
import Format from "../format/Format";
import Stream from "../stream/Stream";

const CurrentlyPlayingScreen: FC = () => {
        return (
        <>
            <Track />
            <Playback />
            <PlaybackStatus />
            <Format />
            <Stream />
        </>
    );
}

export default CurrentlyPlayingScreen;

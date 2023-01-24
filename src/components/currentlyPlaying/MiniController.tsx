import React, { FC } from "react";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import TransportControls from "./TransportControls";
import NowPlaying from "./NowPlaying";

// TODO: Rethink the name of this and its component pieces (TransportControls and NowPlaying) to
//  be more intuitive.

const MiniController: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);

    // TODO: What is the playStatus if the streamer is totally offline?

    return playStatus === "not_ready" ? (
        <></>
    ) : (
        <>
            <TransportControls />
            <NowPlaying />
        </>
    );
};

export default MiniController;

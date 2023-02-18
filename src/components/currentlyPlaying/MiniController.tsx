import React, { FC } from "react";
import { Flex } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import TransportControls from "./TransportControls";
import NowPlaying from "./NowPlaying";

// TODO: Rethink the name of this and its component pieces (TransportControls and NowPlaying) to
//  be more intuitive.

const MiniController: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);

    return ["play", "pause", "buffering"].includes(playStatus || "") ? (
        <Flex gap={10} sx={{ flexGrow: 1 }}>
            <TransportControls />
            <NowPlaying maxPlayheadWidth={300} />
        </Flex>
    ) : (
        <></>
    );
};

export default MiniController;

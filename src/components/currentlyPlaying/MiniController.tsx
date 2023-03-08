import React, { FC } from "react";
import { Box, Flex } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import TransportControls from "./TransportControls";
import NowPlaying from "./NowPlaying";

// TODO: Rethink the name of this and its component pieces (TransportControls and NowPlaying) to
//  be more intuitive.

const MiniController: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);

    const componentHeight = 40;

    return ["play", "pause", "buffering"].includes(playStatus || "") ? (
        <Flex gap={10} mih={componentHeight} mah={componentHeight} sx={{ flexGrow: 1 }}>
            <TransportControls />
            <NowPlaying playheadWidth={300} />
        </Flex>
    ) : (
        <Box mih={componentHeight} mah={componentHeight} />
    );
};

export default MiniController;

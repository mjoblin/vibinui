import React, { FC } from "react";
import { Box, Flex, Text, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import TransportControls from "./TransportControls";
import NowPlaying from "./NowPlaying";

// TODO: Rethink the name of this and its component pieces (TransportControls and NowPlaying) to
//  be more intuitive.

const MiniController: FC = () => {
    const { colors } = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const transportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);

    const componentHeight = 40;

    return transportActions.length > 0 &&
        ["play", "pause", "buffering"].includes(playStatus || "") ? (
        <Flex gap={10} mih={componentHeight} mah={componentHeight} sx={{ flexGrow: 1 }}>
            <TransportControls />
            <NowPlaying playheadWidth={300} />
        </Flex>
    ) : (
        <Flex mih={componentHeight} mah={componentHeight} align="center">
            <Text size="xs" weight="bold" transform="uppercase" color={colors.dark[3]}>
                {`Media controls unavailable ${
                    currentSource && `for ${currentSource.name}`
                }`}
            </Text>
        </Flex>
    );
};

export default MiniController;

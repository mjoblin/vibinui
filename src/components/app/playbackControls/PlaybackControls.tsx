import React, { FC } from "react";
import { Flex, Text, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import TransportControls from "./TransportControls";
import CurrentMediaControls from "./CurrentMediaControls";
import CurrentMediaDetails from "./CurrentMediaDetails";

// ================================================================================================
// Top-level playback controls.
//
// Contents:
//  - Transport controls (play/pause, prev/next, shuffle, repeat).
//  - Media controls for the current track (playhead, codec details, etc).
//  - Details on the current track (art, title, artist).
//  - Replaces controls with message if playback controls don't make sense given the current play
//    status.
// ================================================================================================

const PlaybackControls: FC = () => {
    const { colors } = useMantineTheme();
    const { LARGE_SCREEN } = useAppGlobals();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const transportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );

    const componentHeight = 40;

    return transportActions.length > 0 &&
        ["play", "pause", "buffering"].includes(playStatus || "") ? (
        <Flex gap={10} mih={componentHeight} mah={componentHeight} w="100%">
            <TransportControls />
            <CurrentMediaControls playheadWidth={LARGE_SCREEN ? 300 : 250} />
            <CurrentMediaDetails />
        </Flex>
    ) : (
        <Flex mih={componentHeight} mah={componentHeight} align="center">
            <Text size="xs" weight="bold" transform="uppercase" color={colors.dark[3]}>
                Media controls currently unavailable
            </Text>
        </Flex>
    );
};

export default PlaybackControls;

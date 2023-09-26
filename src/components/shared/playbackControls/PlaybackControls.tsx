import React, { FC, useEffect, useState } from "react";
import { Flex, LoadingOverlay, Text, useMantineTheme } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import BufferingLoader from "../textDisplay/BufferingLoader";
import ConnectingLoader from "../textDisplay/ConnectingLoader";
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
    const { LARGE_SCREEN, BUFFERING_AUDIO_NOTIFY_DELAY } = useAppGlobals();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentScreen = useAppSelector((state: RootState) => state.internal.application.currentScreen);
    const transportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );
    const [showBuffering, setShowBuffering] = useState<boolean>(false);
    const { start: startBufferTimeout, clear: clearBufferTimeout } = useTimeout(
        () => setShowBuffering(true),
        BUFFERING_AUDIO_NOTIFY_DELAY
    );

    /**
     * If the playStatus has been "buffering" for at least BUFFERING_AUDIO_NOTIFY_DELAY ms, then
     * display a "buffering" overlay.
     *
     * Do not show this overlay if on the Current screen (which has its own fullscreen overlay for
     * the buffering state).
     */
    useEffect(() => {
        if (playStatus === "buffering" && currentScreen !== "current") {
            startBufferTimeout();
        } else {
            clearBufferTimeout();
            setShowBuffering(false);
        }

    }, [playStatus, currentScreen, startBufferTimeout, clearBufferTimeout]);

    const componentHeight = 40;

    return (transportActions.length > 0 || playStatus === "connecting") &&
        ["play", "pause", "stop", "buffering", "connecting"].includes(playStatus || "") ? (
        <Flex gap={10} mih={componentHeight} mah={componentHeight} w="100%">
            <LoadingOverlay
                visible={showBuffering || playStatus === "connecting"}
                loader={playStatus === "buffering" ? <BufferingLoader /> : <ConnectingLoader />}
                overlayBlur={0.7}
                overlayOpacity={0.9}
            />

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

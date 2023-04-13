import React, { FC, ReactElement } from "react";
import { Flex, Loader, Text, useMantineTheme } from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { PlayStatus } from "../../../app/store/playbackSlice";

// ================================================================================================
// Display the current play status.
// ================================================================================================

/**
 *
 */
const PlayStateIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);

    const playStatusComponent: Record<PlayStatus, { label: string; component: ReactElement }> = {
        buffering: {
            label: "Buffering data from source",
            component: (
                <Flex gap={10} align="center">
                    <Loader size={14} variant="oval" />
                    <Text size="sm">buffering</Text>
                </Flex>
            ),
        },
        connecting: {
            label: "Connecting to remote source",
            component: (
                <Flex gap={10} align="center">
                    <Loader size={14} variant="bars" />
                    <Text size="sm">connecting</Text>
                </Flex>
            ),
        },
        no_signal: {
            label: "No signal",
            component: <Text size="sm">no signal</Text>,
        },
        not_ready: {
            label: "Powered off",
            component: <Text size="sm">standby</Text>,
        },
        pause: {
            label: "Paused",
            component: (
                <Flex align="center">
                    <IconPlayerPause
                        size={16}
                        stroke={1}
                        color={colors.dark[1]}
                        fill={colors.dark[0]}
                    />
                </Flex>
            ),
        },
        play: {
            label: "Playing",
            component: (
                <Flex align="center">
                    <IconPlayerPlay
                        size={16}
                        stroke={1}
                        color={colors.dark[1]}
                        fill={colors.dark[0]}
                    />
                </Flex>
            ),
        },
        ready: {
            label: "Powered on, not playing",
            component: <Text size="sm">powered on</Text>,
        },
        stop: {
            label: "Stopped",
            component: <Text size="sm">stopped</Text>,
        },
    };

    return playStatus && playStatusComponent[playStatus]
        ? playStatusComponent[playStatus].component
        : null;
};

export default PlayStateIndicator;

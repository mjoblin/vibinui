import React, { FC, ReactElement } from "react";
import { Flex, Loader, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { PlayStatus } from "../../app/store/playbackSlice";

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
                    <Text size="xs">buffering</Text>
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
        ready: {
            label: "Ready",
            component: <Text size="xs">ready</Text>,
        },
        not_ready: {
            label: "Powered off",
            component: <Text size="xs">standby</Text>,
        },
        connecting: {
            label: "Connecting to remote source",
            component: (
                <Flex gap={10} align="center">
                    <Loader size={14} variant="bars" />
                    <Text size="xs">connecting</Text>
                </Flex>
            ),
        },
    };

    return playStatus && playStatusComponent[playStatus]
        ? playStatusComponent[playStatus].component
        : null;
};

export default PlayStateIndicator;

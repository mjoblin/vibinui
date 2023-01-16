import React, { FC } from "react";
import { Flex, Slider, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";

const leadingZeros = new RegExp("^00:");

/**
 * Convert a duration in seconds into "hh:mm:ss", without the hh: if it would have been "00:".
 */
const prettyDuration = (duration: number) =>
    new Date(duration * 1000).toISOString().substring(11, 19).replace(leadingZeros, "");

const Playhead: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const playhead = useAppSelector((state: RootState) => state.playback.playhead);

    return (
        <Flex direction="row" gap={7} align="center">
            {/* TODO: Prevent mm:ss from changing width per second; use fixed width font? */}
            <Text size="xs" sx={{ lineHeight: 1.25, fontSize: 10 }}>
                {playhead.position && typeof playhead.position === "number"
                    ? prettyDuration(playhead.position)
                    : "00:00"}
            </Text>

            <Slider
                min={0}
                max={1}
                value={playhead.position_normalized}
                label={null}
                sx={{ width: 150 }}
                size={2}
                styles={(theme) => ({
                    track: {
                        backgroundColor:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[3]
                                : theme.colors.blue[1],
                    },
                    thumb: {
                        height: 8,
                        width: 3,
                        backgroundColor: theme.white,
                        borderWidth: 1,
                        boxShadow: theme.shadows.sm,
                    },
                })}
            />

            <Text size="xs" sx={{ lineHeight: 1.25, fontSize: 10 }}>
                {currentTrack && typeof currentTrack.duration === "number"
                    ? prettyDuration(currentTrack.duration)
                    : "00:00"}
            </Text>
        </Flex>
    );
};

export default Playhead;

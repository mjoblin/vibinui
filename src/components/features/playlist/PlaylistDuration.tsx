import React, { FC, useEffect, useState } from "react";
import { Flex, RingProgress, Text, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { secstoHms } from "../../../app/utils";

// ================================================================================================
// Display the duration of the active Queue, e.g. "duration: 03:10:19s".
// ================================================================================================

const PlaylistDuration: FC = () => {
    const { colors } = useMantineTheme();
    const [queueDuration, setQueueDuration] = useState<number>(0);
    const [completedItemsProgress, setCompletedItemsProgress] = useState<number>(0);
    const [totalProgress, setTotalProgress] = useState<number>(0);
    const { play_position: currentTrackIndex, items: queueItems } =
        useAppSelector((state: RootState) => state.queue);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const playheadPosition = useAppSelector((state: RootState) => state.playback.playhead.position);
    const playheadPositionNormalized = useAppSelector(
        (state: RootState) => state.playback.playhead.position_normalized,
    );

    /**
     * Calculate the total length of the Queue whenever the Queue items are updated.
     */
    useEffect(() => {
        if (!queueItems || queueItems.length <= 0) {
            setQueueDuration(0);
            return;
        }

        // Sum all item durations (duration is in seconds)
        const totalDuration = queueItems.reduce(
            (total, item) => total + (item.metadata?.duration || 0),
            0
        );
        setQueueDuration(totalDuration);
    }, [queueItems]);

    /**
     * Sum the duration of all completed Queue items. This has no awareness of any progress
     * into the current Queue item (see next effect).
     */
    useEffect(() => {
        if (
            currentTrackIndex === null ||
            currentTrackIndex === undefined ||
            !queueItems ||
            queueItems.length <= 0
        ) {
            setCompletedItemsProgress(0);
            return;
        }

        const progress = queueItems
            .filter((item) => item.position < currentTrackIndex)
            .reduce((totalDuration, item) => totalDuration + (item.metadata?.duration || 0), 0);

        setCompletedItemsProgress(progress);
    }, [queueItems, currentTrackIndex, playStatus]);

    /**
     * Calculate the total progress through the Queue, which is the sum of the completed items
     * plus the distance into the current item.
     */
    useEffect(() => {
        // The check for buffering and playheadPositionNormalized is to reduce the chances that
        // the totalProgress will (briefly) add the progress of the *next* queue item to the
        // *end time* of the previous track. This results in the totalProgress skipping ahead by
        // a full track duration before being reset back to where it should be.
        playStatus !== "buffering" &&
            playheadPositionNormalized < 0.95 &&
            setTotalProgress(completedItemsProgress + playheadPosition);
    }, [completedItemsProgress, playheadPosition, playheadPositionNormalized, playStatus]);

    const completed = (totalProgress / queueDuration) * 100;

    // --------------------------------------------------------------------------------------------

    return (
        <Flex align="center" pl={10}>
            <Text size="xs" pr={5} color={colors.dark[2]}>
                duration:
            </Text>
            <Text size="xs" pr={10} color={colors.dark[2]} weight="bold">{`${secstoHms(
                queueDuration,
            )}s`}</Text>

            {!isNaN(completed) && (
                <>
                    <RingProgress size={40} sections={[{ value: completed, color: "blue" }]} />
                    <Text
                        size="xs"
                        color={colors.blue[5]}
                        weight="bold"
                        miw="1.80rem"
                    >{`${completed.toFixed(0)}%`}</Text>
                </>
            )}
        </Flex>
    );
};

export default PlaylistDuration;

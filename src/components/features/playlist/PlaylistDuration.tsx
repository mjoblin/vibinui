import React, { FC, useEffect, useState } from "react";
import { Flex, RingProgress, Text, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { hmsToSecs, playlistDuration, secstoHms } from "../../../app/utils";

// ================================================================================================
// Display the duration of the active Playlist, e.g. "duration: 03:10:19s".
// ================================================================================================

const PlaylistDuration: FC = () => {
    const { colors } = useMantineTheme();
    const [activePlaylistDuration, setActivePlaylistDuration] = useState<number>(0);
    const [completedEntriesProgress, setCompletedEntriesProgress] = useState<number>(0);
    const [totalProgress, setTotalProgress] = useState<number>(0);
    const { current_track_index, entries: activePlaylistEntries } = useAppSelector(
        (state: RootState) => state.playlist
    );
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const playheadPosition = useAppSelector((state: RootState) => state.playback.playhead.position);
    const playheadPositionNormalized = useAppSelector(
        (state: RootState) => state.playback.playhead.position_normalized
    );

    /**
     * Calculate the total length of the Playlist whenever the Playlist Entries are updated.
     */
    useEffect(() => {
        if (!activePlaylistEntries || activePlaylistEntries.length <= 0) {
            setActivePlaylistDuration(0);
            return;
        }

        setActivePlaylistDuration(playlistDuration(activePlaylistEntries));
    }, [activePlaylistEntries]);

    /**
     * Sum the duration of all completed Playlist Entries. This has no awareness of any progress
     * into the current Playlist Entry (see next effect).
     */
    useEffect(() => {
        if (!current_track_index || !activePlaylistEntries || activePlaylistEntries.length <= 0) {
            setCompletedEntriesProgress(0);
            return;
        }

        const progress = activePlaylistEntries
            .filter((entry) => entry.index < current_track_index)
            .reduce((totalDuration, entry) => totalDuration + hmsToSecs(entry.duration), 0);

        setCompletedEntriesProgress(progress);
    }, [activePlaylistEntries, current_track_index, playStatus]);

    /**
     * Calculate the total progress through the Playlist, which is the sum of the completed Entries
     * plus the distance into the current Entry.
     */
    useEffect(() => {
        // The check for buffering and playheadPositionNormalized is to reduce the chances that
        // the totalProgress will (briefly) add the progress of the *next* playlist entry to the
        // *end time* of the previous track. This results in the totalProgress skipping ahead by
        // a full track duration before being reset back to where it should be.
        playStatus !== "buffering" &&
            playheadPositionNormalized < 0.95 &&
            setTotalProgress(completedEntriesProgress + playheadPosition);
    }, [completedEntriesProgress, playheadPosition, playheadPositionNormalized, playStatus]);

    const completed = (totalProgress / activePlaylistDuration) * 100;

    // --------------------------------------------------------------------------------------------

    return (
        <Flex align="center" pl={10}>
            <Text size="xs" pr={5} color={colors.dark[2]}>
                duration:
            </Text>
            <Text size="xs" pr={10} color={colors.dark[2]} weight="bold">{`${secstoHms(
                activePlaylistDuration
            )}s`}</Text>

            {!isNaN(completed) && (
                <>
                    <RingProgress size={40} sections={[{ value: completed, color: "blue" }]} />
                    <Text size="xs" color={colors.blue[5]} weight="bold" miw="1.80rem">{`${completed.toFixed(
                        0
                    )}%`}</Text>
                </>
            )}
        </Flex>
    );
};

export default PlaylistDuration;

import React, { FC } from "react";
import { Box, Center, createStyles, Loader, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetTracksQuery } from "../../app/services/vibinTracks";
import { setFilteredTrackCount } from "../../app/store/internalSlice";
import TrackCard from "./TrackCard";
import SadLabel from "../shared/SadLabel";

const TrackWall: FC = () => {
    const dispatch = useAppDispatch();
    const filterText = useAppSelector((state: RootState) => state.userSettings.tracks.filterText);
    const [debouncedFilterText] = useDebouncedValue(filterText, 250);
    const { coverSize, coverGap } = useAppSelector((state: RootState) => state.userSettings.tracks);
    const { data: allTracks, error, isLoading } = useGetTracksQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        trackWall: {
            display: "grid",
            gap: coverGap,
            gridTemplateColumns: `repeat(auto-fit, ${coverSize}px)`,
            paddingBottom: 15,
        },
    }))();

    if (isLoading) {
        return (
            <Center>
                <Loader size="sm" />
                <Text size={14} weight="bold" pl={10}>
                    Retrieving tracks...
                </Text>
            </Center>
        );
    }

    if (error) {
        return (
            <Center pt="xl">
                <SadLabel label="Could not retrieve track details" />
            </Center>
        );
    }

    if (!allTracks || allTracks.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Tracks available" />
            </Center>
        );
    }

    const tracksToDisplay = allTracks.filter((track) => {
        if (debouncedFilterText === "") {
            return true;
        }

        const filterValueLower = debouncedFilterText.toLowerCase();

        return (
            // (track.artist || "Various").toLowerCase().includes(filterValueLower) ||
            track.title.toLowerCase().includes(filterValueLower)
        );
    });

    dispatch(setFilteredTrackCount(tracksToDisplay.length));

    if (tracksToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Tracks" />
            </Center>
        );
    }

    return (
        <Box className={dynamicClasses.trackWall}>
            {tracksToDisplay.map((track) => (
                <TrackCard key={track.id} track={track} />
            ))}
        </Box>
    );
};

export default TrackWall;

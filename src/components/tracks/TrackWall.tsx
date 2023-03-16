import React, { FC, useEffect, useState } from "react";
import { Box, Center, createStyles, Loader, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetTracksQuery, useSearchLyricsMutation } from "../../app/services/vibinTracks";
import { setFilteredTrackCount } from "../../app/store/internalSlice";
import TrackCard from "./TrackCard";
import SadLabel from "../shared/SadLabel";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { collectionFilter } from "../../app/utils";

const TrackWall: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppConstants();
    const filterText = useAppSelector((state: RootState) => state.userSettings.tracks.filterText);
    const [debouncedFilterText] = useDebouncedValue(filterText, 250);
    const { cardSize, cardGap, lyricsSearchText } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const { data: allTracks, error, isLoading } = useGetTracksQuery();
    const [searchLyrics, { data: tracksMatchingLyrics }] = useSearchLyricsMutation();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        trackWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    useEffect(() => {
        if (lyricsSearchText !== "") {
            searchLyrics({ query: lyricsSearchText });
        }
    }, [lyricsSearchText, searchLyrics]);

    if (isLoading) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
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

    const tracksToFilter =
        lyricsSearchText !== "" && tracksMatchingLyrics
            ? allTracks.filter((track) => tracksMatchingLyrics.matches.includes(track.id))
            : allTracks;

    const tracksToDisplay = collectionFilter(tracksToFilter, debouncedFilterText, "title");

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
            {[...tracksToDisplay]
                .sort((trackA, trackB) => trackA.title.localeCompare(trackB.title))
                .map((track) => (
                    <TrackCard key={track.id} track={track} />
                ))}
        </Box>
    );
};

export default TrackWall;

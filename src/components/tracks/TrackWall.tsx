import React, { FC, useEffect, useRef } from "react";
import { Box, Center, createStyles } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetTracksQuery, useSearchLyricsMutation } from "../../app/services/vibinTracks";
import { setFilteredTrackMediaIds } from "../../app/store/internalSlice";
import TrackCard from "./TrackCard";
import SadLabel from "../shared/SadLabel";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { collectionFilter } from "../../app/utils";
import LoadingDataMessage from "../shared/LoadingDataMessage";

type TrackWallProps = {
    onNewCurrentTrackRef?: (ref: HTMLDivElement) => void;
}

const TrackWall: FC<TrackWallProps> = ({ onNewCurrentTrackRef }) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const filterText = useAppSelector((state: RootState) => state.userSettings.tracks.filterText);
    const [debouncedFilterText] = useDebouncedValue(filterText, 250);
    const currentTrackRef = useRef<HTMLDivElement>(null);
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
        if (onNewCurrentTrackRef && currentTrackRef && currentTrackRef.current) {
            onNewCurrentTrackRef(currentTrackRef.current);
        }
    }, [currentTrackRef, onNewCurrentTrackRef, currentTrackMediaId]);

    useEffect(() => {
        if (lyricsSearchText !== "") {
            searchLyrics({ query: lyricsSearchText });
        }
    }, [lyricsSearchText, searchLyrics]);

    if (isLoading) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <LoadingDataMessage message="Retrieving tracks..." />
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

    dispatch(setFilteredTrackMediaIds(tracksToDisplay.map((track) => track.id)));

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
                .map((track) =>
                    track.id === currentTrackMediaId ? (
                        <Box ref={currentTrackRef}>
                            <TrackCard key={track.id} track={track} />
                        </Box>
                    ) : (
                        <TrackCard key={track.id} track={track} />
                    )
                )}
        </Box>
    );
};

export default TrackWall;

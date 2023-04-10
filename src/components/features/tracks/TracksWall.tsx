import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { Box, Center, createStyles, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

import type { RootState } from "../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/useInterval";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { Track } from "../../../app/types";
import { useGetTracksQuery, useSearchLyricsMutation } from "../../../app/services/vibinTracks";
import { setFilteredTrackMediaIds } from "../../../app/store/internalSlice";
import { collectionFilter } from "../../../app/utils";
import TrackCard from "./TrackCard";
import SadLabel from "../../shared/textDisplay/SadLabel";
import LoadingDataMessage from "../../shared/textDisplay/LoadingDataMessage";

type TrackWallProps = {
    onNewCurrentTrackRef: (ref: RefObject<HTMLDivElement>) => void;
}

const TracksWall: FC<TrackWallProps> = ({ onNewCurrentTrackRef }) => {
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
    const [searchLyrics, { data: tracksMatchingLyrics, isLoading: isLoadingSearchLyrics }] = useSearchLyricsMutation();
    const [calculatingTracksToDisplay, setCalculatingTracksToDisplay] = useState<boolean>(true);
    const [tracksToDisplay, setTracksToDisplay] = useState<Track[]>([]);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        trackWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    useEffect(() => {
        onNewCurrentTrackRef(currentTrackRef);
    }, [onNewCurrentTrackRef]);


    useEffect(() => {
        lyricsSearchText !== "" && searchLyrics({ query: lyricsSearchText });
    }, [lyricsSearchText, searchLyrics]);
    
    useEffect(() => {
        if (!allTracks || allTracks.length <= 0) {
            return;
        }

        if (
            lyricsSearchText !== "" &&
            (!tracksMatchingLyrics || tracksMatchingLyrics.matches.length <= 0)
        ) {
            // This prevents the UI from briefly flashing all tracks before displaying the tracks
            // which match the lyrics search.
            dispatch(setFilteredTrackMediaIds([]));
            setTracksToDisplay([]);
            return;
        }

        const tracksToFilter =
            lyricsSearchText !== "" && tracksMatchingLyrics
                ? allTracks.filter((track) => tracksMatchingLyrics.matches.includes(track.id))
                : allTracks;

        const tracksToDisplay = collectionFilter(tracksToFilter, debouncedFilterText, "title");

        dispatch(setFilteredTrackMediaIds(tracksToDisplay.map((track) => track.id)));
        setTracksToDisplay(tracksToDisplay);
        setCalculatingTracksToDisplay(false);
    }, [
        allTracks,
        tracksMatchingLyrics,
        filterText,
        debouncedFilterText,
        lyricsSearchText,
        dispatch,
    ]);

    // --------------------------------------------------------------------------------------------

    if (calculatingTracksToDisplay || isLoadingSearchLyrics) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

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

    if (tracksToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Tracks" />
            </Center>
        );
    }

    // --------------------------------------------------------------------------------------------

    return (
        <Box className={dynamicClasses.trackWall}>
            {[...tracksToDisplay]
                .sort((trackA, trackB) => trackA.title.localeCompare(trackB.title))
                .map((track) =>
                    track.id === currentTrackMediaId ? (
                        <Box key={track.id} ref={currentTrackRef}>
                            <TrackCard track={track} />
                        </Box>
                    ) : (
                        <TrackCard key={track.id} track={track} />
                    )
                )}
        </Box>
    );
};

export default TracksWall;

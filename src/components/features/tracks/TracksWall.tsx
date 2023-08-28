import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { Box, Center, createStyles, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

import type { RootState } from "../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { Track } from "../../../app/types";
import { useGetTracksQuery, useSearchLyricsMutation } from "../../../app/services/vibinTracks";
import { setFilteredTrackMediaIds } from "../../../app/store/internalSlice";
import { collectionFilter } from "../../../app/utils";
import TrackCard from "./TrackCard";
import SadLabel from "../../shared/textDisplay/SadLabel";
import LoadingDataMessage from "../../shared/textDisplay/LoadingDataMessage";

// ================================================================================================
// Show a wall of Track art. Reacts to display properties configured via <TracksControls>.
// ================================================================================================

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
    const mediaServer = useAppSelector((state: RootState) => state.system.media_server);
    const { data: allTracks, error, isLoading, status: allTracksStatus } = useGetTracksQuery();
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

    /**
     * Inform the caller of the currentTrackRef on mount. The currentTrackRef will be attached to
     * the card representing the currently-playing Track. This ref will move from card to card
     * over time (as the Track changes).
     */
    useEffect(() => {
        onNewCurrentTrackRef(currentTrackRef);
    }, [onNewCurrentTrackRef]);

    /**
     * Perform a lyrics search.
     */
    useEffect(() => {
        lyricsSearchText !== "" && searchLyrics({ query: lyricsSearchText });
    }, [lyricsSearchText, searchLyrics]);

    /**
     * Determine which Tracks to display. This takes into account any filter text, and the results
     * of any lyrics search.
     */
    useEffect(() => {
        if (allTracksStatus === QueryStatus.rejected) {
            // Inability to retrieve All Tracks is considered a significant-enough problem to stop
            // trying to proceed.
            setCalculatingTracksToDisplay(false);
            return;
        }

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

        // First restrict the filtering to any tracks associated with a current lyrics search.
        const tracksToFilter =
            lyricsSearchText !== "" && tracksMatchingLyrics
                ? allTracks.filter((track) => tracksMatchingLyrics.matches.includes(track.id))
                : allTracks;

        // Perform any filtering based on user input.
        const tracksToDisplay = collectionFilter(tracksToFilter, debouncedFilterText, "title");

        dispatch(setFilteredTrackMediaIds(tracksToDisplay.map((track) => track.id)));
        setTracksToDisplay(tracksToDisplay);
        setCalculatingTracksToDisplay(false);
    }, [
        allTracks,
        allTracksStatus,
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

    if (allTracksStatus === QueryStatus.rejected) {
        return (
            <Center pt="xl">
                <SadLabel
                    label={`Could not locate All Tracks. ${
                        !mediaServer
                            ? "No Media Server registered with Vibin."
                            : "Is the 'All Albums' Media Server path (where Tracks are derived " +
                              "from) correct in the 'Status' screen?"
                    }`}
                />
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

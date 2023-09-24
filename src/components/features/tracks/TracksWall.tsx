import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { Box, Center, createStyles, Loader, MantineColor } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

import type { RootState } from "../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { Track } from "../../../app/types";
import { useGetTracksQuery, useSearchLyricsMutation } from "../../../app/services/vibinTracks";
import { setFilteredTrackMediaIds } from "../../../app/store/internalSlice";
import { collectionFilter, collectionSorter } from "../../../app/utils";
import TrackCard from "./TrackCard";
import SadLabel from "../../shared/textDisplay/SadLabel";
import LoadingDataMessage from "../../shared/textDisplay/LoadingDataMessage";
import MediaTable from "../../shared/mediaDisplay/MediaTable";
import { MediaSortDirection, MediaWallViewMode } from "../../../app/store/userSettingsSlice";

// ================================================================================================
// Show a wall of Tracks. Wall will be either art cards or a table. Reacts to display properties
// configured via <TracksControls>.
// ================================================================================================

type TrackWallProps = {
    filterText?: string;
    viewMode?: MediaWallViewMode;
    sortField?: string;
    sortDirection?: MediaSortDirection;
    cardSize?: number;
    cardGap?: number;
    showDetails?: boolean;
    tableStripeColor?: MantineColor;
    quietUnlessShowingTracks?: boolean;
    cacheCardRenderSize?: boolean;
    onIsFilteringUpdate?: (isFiltering: boolean) => void;
    onDisplayCountUpdate?: (displayCount: number) => void;
    onNewCurrentTrackRef?: (ref: RefObject<HTMLDivElement>) => void;
};

const TracksWall: FC<TrackWallProps> = ({
    filterText = "",
    viewMode = "cards",
    sortField,
    sortDirection,
    cardSize = 50,
    cardGap = 50,
    showDetails = true,
    tableStripeColor,
    quietUnlessShowingTracks = false,
    cacheCardRenderSize = true,
    onIsFilteringUpdate,
    onDisplayCountUpdate,
    onNewCurrentTrackRef,
}) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const [debouncedFilterText] = useDebouncedValue(filterText, 250);
    const currentTrackRef = useRef<HTMLDivElement>(null);
    const { lyricsSearchText, wallSortDirection, wallSortField } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const mediaServer = useAppSelector((state: RootState) => state.system.media_server);
    const { data: allTracks, error, isLoading, status: allTracksStatus } = useGetTracksQuery();
    const [searchLyrics, { data: tracksMatchingLyrics, isLoading: isLoadingSearchLyrics }] =
        useSearchLyricsMutation();
    const [calculatingTracksToDisplay, setCalculatingTracksToDisplay] = useState<boolean>(false);
    const [tracksToDisplay, setTracksToDisplay] = useState<Track[]>([]);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        cardWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
        tableWall: {
            paddingBottom: 15,
        },
    }))();

    /**
     * Inform the caller of the currentTrackRef on mount. The currentTrackRef will be attached to
     * the card representing the currently-playing Track. This ref will move from card to card
     * over time (as the Track changes).
     */
    useEffect(() => {
        onNewCurrentTrackRef && onNewCurrentTrackRef(currentTrackRef);
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
            setCalculatingTracksToDisplay(false);
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
            setCalculatingTracksToDisplay(false);
            return;
        }

        setCalculatingTracksToDisplay(true);

        // First restrict the filtering to any tracks associated with a current lyrics search.
        const tracksToFilter =
            lyricsSearchText !== "" && tracksMatchingLyrics
                ? allTracks.filter((track) => tracksMatchingLyrics.matches.includes(track.id))
                : allTracks;

        // Perform any filtering based on user input.
        const processedTracks = collectionFilter(tracksToFilter, debouncedFilterText, "title")
            .slice()
            .sort(collectionSorter(sortField || wallSortField, sortDirection || wallSortDirection));

        dispatch(setFilteredTrackMediaIds(processedTracks.map((track) => track.id)));
        setTracksToDisplay(processedTracks);
        setCalculatingTracksToDisplay(false);
    }, [
        allTracks,
        allTracksStatus,
        debouncedFilterText,
        dispatch,
        filterText,
        lyricsSearchText,
        sortDirection,
        sortField,
        tracksMatchingLyrics,
        wallSortDirection,
        wallSortField,
    ]);

    /**
     * Notify parent component of current filtering state.
     */
    useEffect(() => {
        onIsFilteringUpdate && onIsFilteringUpdate(calculatingTracksToDisplay);
    }, [calculatingTracksToDisplay, onIsFilteringUpdate]);

    /**
     * Notify parent component of updated display count.
     */
    useEffect(() => {
        onDisplayCountUpdate && onDisplayCountUpdate(tracksToDisplay.length);
    }, [tracksToDisplay, onDisplayCountUpdate]);

    // --------------------------------------------------------------------------------------------

    if (calculatingTracksToDisplay || isLoadingSearchLyrics) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    if (quietUnlessShowingTracks && tracksToDisplay.length <= 0) {
        return <></>;
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

    return viewMode === "table" ? (
        <Box className={dynamicClasses.tableWall}>
            <MediaTable
                media={tracksToDisplay}
                columns={["album_art_uri", "title", "artist", "album", "date", "duration", "genre"]}
                stripeColor={tableStripeColor}
                currentlyPlayingId={currentTrackMediaId}
                currentlyPlayingRef={currentTrackRef}
            />
        </Box>
    ) : (
        <Box className={dynamicClasses.cardWall}>
            {[...tracksToDisplay]
                .sort((trackA, trackB) => trackA.title.localeCompare(trackB.title))
                .map((track) =>
                    track.id === currentTrackMediaId ? (
                        <Box key={track.id} ref={currentTrackRef}>
                            <TrackCard
                                track={track}
                                size={cardSize}
                                showDetails={showDetails}
                                cacheRenderSize={cacheCardRenderSize}
                            />
                        </Box>
                    ) : (
                        <TrackCard
                            key={track.id}
                            track={track}
                            size={cardSize}
                            showDetails={showDetails}
                            cacheRenderSize={cacheCardRenderSize}
                        />
                    )
                )}
        </Box>
    );
};

export default TracksWall;

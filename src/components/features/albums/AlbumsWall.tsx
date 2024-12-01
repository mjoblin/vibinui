import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { Box, Center, createStyles, Loader, MantineColor } from "@mantine/core";

import { Album } from "../../../app/types";
import type { RootState } from "../../../app/store/store";
import MediaTable from "../../shared/mediaDisplay/MediaTable";
import AlbumCard from "./AlbumCard";
import SadLabel from "../../shared/textDisplay/SadLabel";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../../app/services/vibinAlbums";
import { setFilteredAlbumMediaIds } from "../../../app/store/internalSlice";
import {
    AlbumCollection,
    MediaSortDirection,
    MediaWallViewMode,
} from "../../../app/store/userSettingsSlice";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { collectionFilter, collectionSorter } from "../../../app/utils";

// ================================================================================================
// Show a wall of Albums. Wall will be either art cards or a table. Reacts to display properties
// configured via <AlbumsControls>.
// ================================================================================================

type AlbumWallProps = {
    filterText?: string;
    activeCollection?: AlbumCollection;
    viewMode?: MediaWallViewMode;
    sortField?: string;
    sortDirection?: MediaSortDirection;
    cardSize?: number;
    cardGap?: number;
    showDetails?: boolean;
    tableStripeColor?: MantineColor;
    quietUnlessShowingAlbums?: boolean;
    cacheCardRenderSize?: boolean;
    onIsFilteringUpdate?: (isFiltering: boolean) => void;
    onDisplayCountUpdate?: (displayCount: number) => void;
    onNewCurrentAlbumRef?: (ref: RefObject<HTMLDivElement>) => void;
};

const AlbumsWall: FC<AlbumWallProps> = ({
    filterText = "",
    activeCollection = "all",
    viewMode = "cards",
    sortField,
    sortDirection,
    cardSize = 50,
    cardGap = 50,
    showDetails = true,
    tableStripeColor,
    quietUnlessShowingAlbums = false,
    cacheCardRenderSize = true,
    onIsFilteringUpdate,
    onDisplayCountUpdate,
    onNewCurrentAlbumRef,
}) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const currentAlbumRef = useRef<HTMLDivElement>(null);
    const { wallSortDirection, wallSortField } = useAppSelector(
        (state: RootState) => state.userSettings.albums,
    );
    const mediaServer = useAppSelector((state: RootState) => state.system.media_server);
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id,
    );
    const {
        data: allAlbums,
        error: allAlbumsError,
        isLoading: isLoadingAllAlbums,
        status: allAlbumsStatus,
    } = useGetAlbumsQuery();
    const {
        data: newAlbums,
        error: newAlbumsError,
        isLoading: isLoadingNewAlbums,
        status: newAlbumsStatus,
    } = useGetNewAlbumsQuery();
    const [calculatingAlbumsToDisplay, setCalculatingAlbumsToDisplay] = useState<boolean>(true);
    const [albumsToDisplay, setAlbumsToDisplay] = useState<Album[]>([]);

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
     * When the active collection ("All"/"New") changes, trigger the calculating loader.
     */
    useEffect(() => {
        setCalculatingAlbumsToDisplay(true);
    }, [activeCollection]);

    /**
     * Inform the caller of the currentAlbumRef on mount. The currentAlbumRef will be attached to
     * the card representing the currently-playing Album. This ref will move from card to card
     * over time (as the Album changes).
     */
    useEffect(() => {
        onNewCurrentAlbumRef && onNewCurrentAlbumRef(currentAlbumRef);
    }, [onNewCurrentAlbumRef]);

    /**
     * Determine which Albums to display. This takes into account the current "All Albums"/"New
     * Albums" selection, and any filter text.
     */
    useEffect(() => {
        if (isLoadingAllAlbums || isLoadingNewAlbums) {
            return;
        }

        if (allAlbumsStatus === QueryStatus.rejected) {
            // Inability to retrieve All Albums is considered a significant-enough problem to stop
            // trying to proceed. Inability to retrieve New Albums isn't as severe.
            setCalculatingAlbumsToDisplay(false);
            return;
        }

        if (!allAlbums || !newAlbums) {
            setCalculatingAlbumsToDisplay(false);
            return;
        }

        setCalculatingAlbumsToDisplay(true);

        // Decide which collection to show. This will either be all albums; new albums; or just the
        // album currently playing.

        const collection =
            activeCollection === "all" ? allAlbums : activeCollection === "new" ? newAlbums : [];

        let processedAlbums = collectionFilter(collection || [], filterText, "title")
            .slice()
            .sort(collectionSorter(sortField || wallSortField, sortDirection || wallSortDirection));

        dispatch(setFilteredAlbumMediaIds(processedAlbums.map((album) => album.id)));

        setAlbumsToDisplay(processedAlbums);
        setCalculatingAlbumsToDisplay(false);
    }, [
        activeCollection,
        allAlbums,
        allAlbumsStatus,
        dispatch,
        filterText,
        isLoadingAllAlbums,
        isLoadingNewAlbums,
        newAlbums,
        sortDirection,
        sortField,
        wallSortDirection,
        wallSortField,
    ]);

    /**
     * Notify parent component of current filtering state.
     */
    useEffect(() => {
        onIsFilteringUpdate && onIsFilteringUpdate(calculatingAlbumsToDisplay);
    }, [calculatingAlbumsToDisplay, onIsFilteringUpdate]);

    /**
     * Notify parent component of updated display count.
     */
    useEffect(() => {
        onDisplayCountUpdate && onDisplayCountUpdate(albumsToDisplay.length);
    }, [albumsToDisplay, onDisplayCountUpdate]);

    // --------------------------------------------------------------------------------------------

    if (calculatingAlbumsToDisplay || isLoadingAllAlbums || isLoadingNewAlbums) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    if (quietUnlessShowingAlbums && albumsToDisplay.length <= 0) {
        return <></>;
    }

    if (allAlbumsStatus === QueryStatus.rejected) {
        return (
            <Center pt="xl">
                <SadLabel
                    label={`Could not locate All Albums. ${
                        !mediaServer
                            ? "No Media Server registered with Vibin."
                            : "Are the Media Server paths correct in the 'Status' screen?"
                    }`}
                />
            </Center>
        );
    }

    if (activeCollection === "new" && newAlbumsStatus === QueryStatus.rejected) {
        return (
            <Center pt="xl">
                <SadLabel
                    label={`Could not locate New Albums. ${
                        !mediaServer
                            ? "No Media Server registered with Vibin."
                            : "Are the Media Server paths correct in the 'Status' screen?"
                    }`}
                />
            </Center>
        );
    }

    if (
        (activeCollection === "all" && allAlbumsError) ||
        (activeCollection === "new" && newAlbumsError)
    ) {
        return (
            <Center pt="xl">
                <SadLabel label="Error retrieving Album details" />
            </Center>
        );
    }

    if (!allAlbums || allAlbums.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Albums available" />
            </Center>
        );
    }

    if (albumsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Albums" />
            </Center>
        );
    }

    // --------------------------------------------------------------------------------------------

    return viewMode === "table" ? (
        <Box className={dynamicClasses.tableWall}>
            <MediaTable
                media={albumsToDisplay}
                columns={["album_art_uri", "title", "artist", "year", "genre"]}
                stripeColor={tableStripeColor}
                currentlyPlayingId={currentAlbumMediaId}
                currentlyPlayingRef={currentAlbumRef}
            />
        </Box>
    ) : (
        <Box className={dynamicClasses.cardWall}>
            {albumsToDisplay.map((album: Album) =>
                album.id === currentAlbumMediaId ? (
                    <Box key={album.id} ref={currentAlbumRef}>
                        <AlbumCard
                            album={album}
                            size={cardSize}
                            showDetails={showDetails}
                            cacheRenderSize={cacheCardRenderSize}
                        />
                    </Box>
                ) : (
                    <AlbumCard
                        key={album.id}
                        album={album}
                        size={cardSize}
                        showDetails={showDetails}
                        cacheRenderSize={cacheCardRenderSize}
                    />
                ),
            )}
        </Box>
    );
};

export default AlbumsWall;

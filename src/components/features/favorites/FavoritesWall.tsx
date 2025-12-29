import React, { FC, useEffect, useState } from "react";
import {
    Box,
    Center,
    createStyles,
    Loader,
    MantineColor,
    Stack,
    useMantineTheme,
} from "@mantine/core";

import { Album, Track } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { RootState } from "../../../app/store/store";
import { collectionFilter, collectionSorter } from "../../../app/utils";
import { setFilteredFavoriteMediaIds } from "../../../app/store/internalSlice";
import { Favorite } from "../../../app/services/vibinFavorites";
import {
    FavoriteCollection,
    MediaSortDirection,
    MediaWallViewMode,
} from "../../../app/store/userSettingsSlice";
import AlbumCard from "../albums/AlbumCard";
import MediaTable from "../../shared/mediaDisplay/MediaTable";
import SadLabel from "../../shared/textDisplay/SadLabel";
import StylizedLabel from "../../shared/textDisplay/StylizedLabel";
import TrackCard from "../tracks/TrackCard";

// ================================================================================================
// Show a wall of Favorites. Wall will be either art cards or a table. Reacts to display properties
// configured via <FavoritesControls>.
//
// Favorites can be Albums or Tracks.
//
// NOTE: The FavoritesWall differs from the Artists/Albums/Tracks walls in that it gets its data
//  (the favorites) directly from the redux state, not from an API call. This is because Favorites
//  are likely to update more often than Artists/Albums/Tracks.
// ================================================================================================

type FavoritesWallProps = {
    filterText?: string;
    activeCollection?: FavoriteCollection;
    viewMode?: MediaWallViewMode;
    sortField?: string;
    sortDirection?: MediaSortDirection;
    cardSize?: number;
    cardGap?: number;
    showDetails?: boolean;
    tableStripeColor?: MantineColor;
    quietUnlessShowingFavorites?: boolean;
    cacheCardRenderSize?: boolean;
    onIsFilteringUpdate?: (isFiltering: boolean) => void;
    onDisplayCountUpdate?: (displayCount: number) => void;
};

const FavoritesWall: FC<FavoritesWallProps> = ({
    filterText = "",
    viewMode = "cards",
    sortField,
    sortDirection,
    activeCollection = "all",
    cardSize = 50,
    cardGap = 50,
    showDetails = true,
    tableStripeColor,
    quietUnlessShowingFavorites = false,
    cacheCardRenderSize = true,
    onIsFilteringUpdate,
    onDisplayCountUpdate,
}) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const { colors } = useMantineTheme();
    const { favorites, haveReceivedInitialState } = useAppSelector(
        (state: RootState) => state.favorites,
    );
    const { wallSortDirection, wallSortField } = useAppSelector(
        (state: RootState) => state.userSettings.favorites,
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id,
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id,
    );
    const [favoritesToDisplay, setFavoritesToDisplay] = useState<Favorite[]>([]);
    const [albumsToDisplay, setAlbumsToDisplay] = useState<Album[]>([]);
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
     * Determine which Favorites to display, based on any filter text and whether the user has
     * chosen to view Album or Track Favorites (or both).
     */
    useEffect(() => {
        onIsFilteringUpdate && onIsFilteringUpdate(true);

        const albumFavorites = favorites.filter((favorite) => favorite.type === "album");
        const trackFavorites = favorites.filter((favorite) => favorite.type === "track");

        const processedAlbumFavorites = collectionFilter(
            albumFavorites,
            filterText,
            "title",
            "media",
        )
            .slice()
            .sort(
                collectionSorter(
                    `media.${sortField || wallSortField}`,
                    sortDirection || wallSortDirection,
                ),
            );

        const processedTrackFavorites = collectionFilter(
            trackFavorites,
            filterText,
            "title",
            "media",
        )
            .slice()
            .sort(
                collectionSorter(
                    `media.${sortField || wallSortField}`,
                    sortDirection || wallSortDirection,
                ),
            );

        if (activeCollection === "all") {
            dispatch(
                setFilteredFavoriteMediaIds({
                    albums: processedAlbumFavorites.map((albumFavorite) => albumFavorite.media_id),
                    tracks: processedTrackFavorites.map((trackFavorite) => trackFavorite.media_id),
                }),
            );

            setFavoritesToDisplay([...processedAlbumFavorites, ...processedTrackFavorites]);
        } else {
            dispatch(
                setFilteredFavoriteMediaIds({
                    albums:
                        activeCollection === "albums"
                            ? processedAlbumFavorites.map((albumFavorite) => albumFavorite.media_id)
                            : [],
                    tracks:
                        activeCollection === "tracks"
                            ? processedTrackFavorites.map((trackFavorite) => trackFavorite.media_id)
                            : [],
                }),
            );

            activeCollection === "albums" && setFavoritesToDisplay(processedAlbumFavorites);
            activeCollection === "tracks" && setFavoritesToDisplay(processedTrackFavorites);
        }

        onIsFilteringUpdate && onIsFilteringUpdate(false);
    }, [
        activeCollection,
        dispatch,
        favorites,
        filterText,
        onIsFilteringUpdate,
        sortDirection,
        sortField,
        wallSortDirection,
        wallSortField,
    ]);

    /**
     * When the favorites have been processed as a whole, divide them up into the albums and tracks
     * to be displayed.
     */
    useEffect(() => {
        setAlbumsToDisplay(
            favoritesToDisplay
                .filter((favorite) => favorite.type === "album")
                .map((favorite) => favorite.media as Album),
        );

        setTracksToDisplay(
            favoritesToDisplay
                .filter((favorite) => favorite.type === "track")
                .map((favorite) => favorite.media as Track),
        );
    }, [favoritesToDisplay]);

    /**
     * Notify parent component of updated display count.
     */
    useEffect(() => {
        onDisplayCountUpdate && onDisplayCountUpdate(favoritesToDisplay.length);
    }, [favoritesToDisplay, onDisplayCountUpdate]);

    // --------------------------------------------------------------------------------------------

    if (!haveReceivedInitialState) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    if (quietUnlessShowingFavorites && favoritesToDisplay.length <= 0) {
        return <></>;
    }

    if (favorites.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Favorites found" />
            </Center>
        );
    }

    const favoriteAlbumsCount = favorites.filter((favorite) => favorite.type === "album").length;
    const favoriteTracksCount = favorites.filter((favorite) => favorite.type === "track").length;

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing="xs">
            {["albums", "all"].includes(activeCollection) &&
                !(albumsToDisplay.length <= 0 && quietUnlessShowingFavorites) && (
                    <>
                        {/* Favorite albums */}
                        <StylizedLabel color={colors.gray[6]} size={20}>
                            albums
                        </StylizedLabel>

                        {viewMode === "table" ? (
                            <Box className={dynamicClasses.tableWall}>
                                <MediaTable
                                    media={albumsToDisplay}
                                    columns={["album_art_uri", "title", "artist", "year", "genre"]}
                                    stripeColor={tableStripeColor}
                                    currentlyPlayingId={currentAlbumMediaId}
                                />
                            </Box>
                        ) : (
                            <Box className={dynamicClasses.cardWall}>
                                {albumsToDisplay.length > 0 ? (
                                    albumsToDisplay.map((album) => (
                                        <AlbumCard
                                            key={album.id}
                                            album={album}
                                            enabledActions={{
                                                Details: ["all"],
                                                Favorites: ["all"],
                                                Navigation: ["all"],
                                                Playlist: ["all"],
                                                Presets: ["all"],
                                            }}
                                            size={cardSize}
                                            showDetails={showDetails}
                                            cacheRenderSize={cacheCardRenderSize}
                                        />
                                    ))
                                ) : (
                                    <SadLabel
                                        label={
                                            favoriteAlbumsCount <= 0
                                                ? "No favorited Albums"
                                                : "No matching Albums"
                                        }
                                    />
                                )}
                            </Box>
                        )}
                    </>
                )}

            {["tracks", "all"].includes(activeCollection) &&
                !(tracksToDisplay.length <= 0 && quietUnlessShowingFavorites) && (
                    <>
                        {/* Favorite tracks */}
                        <StylizedLabel color={colors.gray[6]} size={20}>
                            tracks
                        </StylizedLabel>

                        {viewMode === "table" ? (
                            <Box className={dynamicClasses.tableWall}>
                                <MediaTable
                                    media={tracksToDisplay}
                                    columns={[
                                        "album_art_uri",
                                        "title",
                                        "artist",
                                        "album",
                                        "year",
                                        "genre",
                                    ]}
                                    stripeColor={tableStripeColor}
                                    currentlyPlayingId={currentTrackMediaId}
                                />
                            </Box>
                        ) : (
                            <Box className={dynamicClasses.cardWall}>
                                {tracksToDisplay.length > 0 ? (
                                    tracksToDisplay.map((track) => (
                                        <TrackCard
                                            key={track.id}
                                            track={track}
                                            enabledActions={{
                                                Details: ["all"],
                                                Favorites: ["all"],
                                                Navigation: ["all"],
                                                Playlist: ["all"],
                                                Presets: ["all"],
                                            }}
                                            size={cardSize}
                                            showDetails={showDetails}
                                            cacheRenderSize={cacheCardRenderSize}
                                        />
                                    ))
                                ) : (
                                    <SadLabel
                                        label={
                                            favoriteTracksCount <= 0
                                                ? "No favorited Tracks"
                                                : "No matching Tracks"
                                        }
                                    />
                                )}
                            </Box>
                        )}
                    </>
                )}
        </Stack>
    );
};

export default FavoritesWall;

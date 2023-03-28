import React, { FC } from "react";
import { Box, Center, createStyles, Stack, useMantineTheme } from "@mantine/core";

import { Album, Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { collectionFilter } from "../../app/utils";
import { setFilteredFavoriteMediaIds } from "../../app/store/internalSlice";
import AlbumCard from "../albums/AlbumCard";
import SadLabel from "../shared/SadLabel";
import StylizedLabel from "../shared/StylizedLabel";
import TrackCard from "../tracks/TrackCard";

const FavoritesWall: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const filterText = useAppSelector(
        (state: RootState) => state.userSettings.favorites.filterText
    );
    const { activeCollection, cardSize, cardGap, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.favorites
    );

    const { classes: dynamicClasses } = createStyles((theme) => ({
        favoritesWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    if (!favorites || favorites.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Favorites found" />
            </Center>
        );
    }

    const albumFavorites = favorites.filter((favorite) => favorite.type === "album");
    const trackFavorites = favorites.filter((favorite) => favorite.type === "track");

    // NOTE: The favorites will be filtered based on the filterText, using collectionFilter(). But
    //  collectionFilter() expects an array of Media items, and favorites are different -- they
    //  have their Media item embedded inside a dictionary (under the "media" key). So the favorite
    //  collection is first mapped into a collectionFilter()-compliant array before filtering.

    if (activeCollection !== "all") {
        // Show the requested album or track favorites collection as a single wall

        const collectionToShow = collectionFilter(
            (activeCollection === "albums" ? albumFavorites : trackFavorites).map(
                (favorite) => favorite.media
            ),
            filterText,
            "title"
        );

        dispatch(setFilteredFavoriteMediaIds(collectionToShow.map((favorite) => favorite.id)));

        return collectionToShow.length > 0 ? (
            <Box className={dynamicClasses.favoritesWall}>
                {collectionToShow.map((favoriteMedia) =>
                    activeCollection === "albums" ? (
                        <AlbumCard
                            key={favoriteMedia.id}
                            album={favoriteMedia as Album}
                            sizeOverride={cardSize}
                            detailsOverride={showDetails}
                        />
                    ) : (
                        <TrackCard
                            key={favoriteMedia.id}
                            track={favoriteMedia as Track}
                            sizeOverride={cardSize}
                            detailsOverride={showDetails}
                        />
                    )
                )}
            </Box>
        ) : (
            <Center pt="xl">
                {activeCollection === "albums" &&
                    (albumFavorites.length <= 0 ? (
                        <SadLabel label={"No favorited Albums"} />
                    ) : (
                        <SadLabel label={"No matching Albums"} />
                    ))}

                {activeCollection === "tracks" &&
                    (trackFavorites.length <= 0 ? (
                        <SadLabel label={"No favorited Tracks"} />
                    ) : (
                        <SadLabel label={"No matching Tracks"} />
                    ))}
            </Center>
        );
    }

    // We're showing all favorites, so divide them into separate "albums" and "tracks" walls.

    const filteredAlbumFavorites = collectionFilter(
        albumFavorites.map((favorite) => favorite.media),
        filterText,
        "title"
    );

    const filteredTrackFavorites = collectionFilter(
        trackFavorites.map((favorite) => favorite.media),
        filterText,
        "title"
    );

    dispatch(
        setFilteredFavoriteMediaIds([
            ...filteredAlbumFavorites.map((albumFavorite) => albumFavorite.id),
            ...filteredTrackFavorites.map((trackFavorite) => trackFavorite.id),
        ])
    );

    return (
        <Stack spacing="xs">
            {/* Favorite albums */}

            <StylizedLabel color={colors.gray[7]}>favorite albums</StylizedLabel>

            <Box className={dynamicClasses.favoritesWall}>
                {filteredAlbumFavorites.length > 0 ? (
                    filteredAlbumFavorites.map((favorite) => (
                        <AlbumCard
                            key={favorite.id}
                            album={favorite as Album}
                            enabledActions={{
                                Details: ["all"],
                                Favorites: ["all"],
                                Navigation: ["all"],
                                Playlist: ["all"],
                            }}
                            sizeOverride={cardSize}
                            detailsOverride={showDetails}
                        />
                    ))
                ) : (
                    <SadLabel
                        label={
                            albumFavorites.length <= 0
                                ? "No favorited Albums"
                                : "No matching Albums"
                        }
                    />
                )}
            </Box>

            {/* Favorite tracks */}

            <StylizedLabel color={colors.gray[7]}>favorite tracks</StylizedLabel>

            <Box className={dynamicClasses.favoritesWall}>
                {filteredTrackFavorites.length > 0 ? (
                    filteredTrackFavorites.map((favorite) => (
                        <TrackCard
                            key={favorite.id}
                            track={favorite as Track}
                            enabledActions={{
                                Details: ["all"],
                                Favorites: ["all"],
                                Navigation: ["all"],
                                Playlist: ["all"],
                            }}
                            sizeOverride={cardSize}
                            detailsOverride={showDetails}
                        />
                    ))
                ) : (
                    <SadLabel
                        label={
                            trackFavorites.length <= 0
                                ? "No favorited Tracks"
                                : "No matching Tracks"
                        }
                    />
                )}
            </Box>
        </Stack>
    );
};

export default FavoritesWall;

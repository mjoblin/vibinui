import React, { FC, useEffect, useState } from "react";
import { Box, Center, createStyles, Loader, Stack, useMantineTheme } from "@mantine/core";

import { Album, Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { RootState } from "../../app/store/store";
import { collectionFilter } from "../../app/utils";
import { setFilteredFavoriteMediaIds } from "../../app/store/internalSlice";
import { Favorite } from "../../app/services/vibinFavorites";
import AlbumCard from "../albums/AlbumCard";
import SadLabel from "../shared/SadLabel";
import StylizedLabel from "../shared/StylizedLabel";
import TrackCard from "../tracks/TrackCard";

const FavoritesWall: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const { colors } = useMantineTheme();
    const { favorites, haveReceivedInitialState } = useAppSelector((state: RootState) => state.favorites);
    const filterText = useAppSelector(
        (state: RootState) => state.userSettings.favorites.filterText
    );
    const { activeCollection, cardSize, cardGap, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.favorites
    );
    const [favoritesToDisplay, setFavoritesToDisplay] = useState<Favorite[]>([]);

    // NOTE: The FavoritesWall differs from the Artists/Albums/Tracks walls in that it gets its data
    //  (the favorites) directly from the redux state, not from an API call. This is because
    //  Favorites are likely to update more often than Artists/Albums/Tracks.

    const { classes: dynamicClasses } = createStyles((theme) => ({
        favoritesWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    useEffect(() => {
        const albumFavorites = favorites.filter((favorite) => favorite.type === "album");
        const trackFavorites = favorites.filter((favorite) => favorite.type === "track");
        const filteredAlbumFavorites = collectionFilter(albumFavorites, filterText, "media.title");
        const filteredTrackFavorites = collectionFilter(trackFavorites, filterText, "media.title");

        if (activeCollection === "all") {
            dispatch(
                setFilteredFavoriteMediaIds({
                    albums: filteredAlbumFavorites.map((albumFavorite) => albumFavorite.media_id),
                    tracks: filteredTrackFavorites.map((trackFavorite) => trackFavorite.media_id),
                })
            );

            setFavoritesToDisplay([...filteredAlbumFavorites, ...filteredTrackFavorites]);
        } else {
            dispatch(
                setFilteredFavoriteMediaIds({
                    albums:
                        activeCollection === "albums"
                            ? filteredAlbumFavorites.map((albumFavorite) => albumFavorite.media_id)
                            : [],
                    tracks:
                        activeCollection === "tracks"
                            ? filteredTrackFavorites.map((trackFavorite) => trackFavorite.media_id)
                            : [],
                })
            );

            activeCollection === "albums" && setFavoritesToDisplay(filteredAlbumFavorites);
            activeCollection === "tracks" && setFavoritesToDisplay(filteredTrackFavorites);
        }
    }, [favorites, filterText, activeCollection, dispatch]);

    // --------------------------------------------------------------------------------------------

    if (!haveReceivedInitialState) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
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
    const albumsToDisplay = favoritesToDisplay.filter((favorite) => favorite.type === "album");
    const tracksToDisplay = favoritesToDisplay.filter((favorite) => favorite.type === "track");

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing="xs">
            {["albums", "all"].includes(activeCollection) && (
                <>
                    {/* Favorite albums */}
                    <StylizedLabel color={colors.gray[7]}>favorite albums</StylizedLabel>

                    <Box className={dynamicClasses.favoritesWall}>
                        {albumsToDisplay.length > 0 ? (
                            albumsToDisplay.map((favorite) => (
                                <AlbumCard
                                    key={favorite.media_id}
                                    album={favorite.media as Album}
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
                                    favoriteAlbumsCount <= 0
                                        ? "No favorited Albums"
                                        : "No matching Albums"
                                }
                            />
                        )}
                    </Box>
                </>
            )}

            {["tracks", "all"].includes(activeCollection) && (
                <>
                    {/* Favorite tracks */}
                    <StylizedLabel color={colors.gray[7]}>favorite tracks</StylizedLabel>

                    <Box className={dynamicClasses.favoritesWall}>
                        {tracksToDisplay.length > 0 ? (
                            tracksToDisplay.map((favorite) => (
                                <TrackCard
                                    key={favorite.media_id}
                                    track={favorite.media as Track}
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
                                    favoriteTracksCount <= 0
                                        ? "No favorited Tracks"
                                        : "No matching Tracks"
                                }
                            />
                        )}
                    </Box>
                </>
            )}
        </Stack>
    );
};

export default FavoritesWall;

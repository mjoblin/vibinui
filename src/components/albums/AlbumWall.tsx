import React, { FC } from "react";
import { Box, Center, createStyles, Loader, Text } from "@mantine/core";

import { Album } from "../../app/types";
import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import { setFilteredAlbumCount } from "../../app/store/internalSlice";
import AlbumCard from "./AlbumCard";
import SadLabel from "../shared/SadLabel";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const AlbumWall: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppConstants();
    const filterText = useAppSelector((state: RootState) => state.userSettings.albums.filterText);
    const { activeCollection, cardSize, cardGap } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const { data: allAlbums, error: allError, isLoading: allIsLoading } = useGetAlbumsQuery();
    const { data: newAlbums, error: newError, isLoading: newIsLoading } = useGetNewAlbumsQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    if ((activeCollection === "all" && allIsLoading) || (activeCollection === "new" && newIsLoading)) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader size="sm" />
                <Text size={14} weight="bold" pl={10}>
                    Retrieving albums...
                </Text>
            </Center>
        );
    }

    if ((activeCollection === "all" && allError) || (activeCollection === "new" && newError)) {
        return (
            <Center pt="xl">
                <SadLabel label="Could not retrieve album details" />
            </Center>
        );
    }

    // Decide which collection to show. This will either be all albums; new albums; or just the
    // album currently playing.
    
    const albumMatchingCurrentlyPlaying = allAlbums?.find(
        (album) => album.id === currentAlbumMediaId
    );
    
    const collection =
        activeCollection === "all"
            ? allAlbums
            : activeCollection === "new"
            ? newAlbums
            : (albumMatchingCurrentlyPlaying ? [albumMatchingCurrentlyPlaying] : []) as Album[];

    if (!collection || collection.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Albums available" />
            </Center>
        );
    }

    const albumsToDisplay = collection
        .filter((album) => {
            if (filterText === "") {
                return true;
            }

            const filterValueLower = filterText.toLowerCase();

            return (
                (album.artist || "Various").toLowerCase().includes(filterValueLower) ||
                album.title.toLowerCase().includes(filterValueLower)
            );
        })
        // TODO: Fix "Various" (unknown artist)
        // .sort((a, b) => (a.artist || "Various").localeCompare(b.artist || "Various"));

    dispatch(setFilteredAlbumCount(albumsToDisplay.length));

    if (albumsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Albums" />
            </Center>
        );
    }

    return (
        <Box className={dynamicClasses.albumWall}>
            {albumsToDisplay.map((album) => (
                <AlbumCard
                    key={album.id}
                    album={album}
                    selected={album.id === currentAlbumMediaId}
                />
            ))}
        </Box>
    );
};

export default AlbumWall;

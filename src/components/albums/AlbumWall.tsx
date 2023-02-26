import React, { FC } from "react";
import { Box, Center, createStyles, Loader, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import { setFilteredAlbumCount } from "../../app/store/internalSlice";
import AlbumCard from "./AlbumCard";
import SadLabel from "../shared/SadLabel";

const AlbumWall: FC = () => {
    const dispatch = useAppDispatch();
    const filterText = useAppSelector((state: RootState) => state.userSettings.albums.filterText);
    const { activeCollection, cardSize, cardGap } = useAppSelector(
        (state: RootState) => state.userSettings.albums
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
            <Center>
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

    const collection = activeCollection === "all" ? allAlbums : newAlbums;

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
                <AlbumCard key={album.id} album={album} />
            ))}
        </Box>
    );
};

export default AlbumWall;

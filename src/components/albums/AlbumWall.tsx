import React, { FC } from "react";
import { Box, Center, createStyles, Flex, Loader, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery } from "../../app/services/vibinBase";
import { setFilteredAlbumCount } from "../../app/store/internalSlice";
import AlbumCard from "./AlbumCard";
import SadLabel from "../shared/SadLabel";

const AlbumWall: FC = () => {
    const dispatch = useAppDispatch();
    const filterText = useAppSelector((state: RootState) => state.userSettings.browse.filterText);
    const { coverSize, coverGap } = useAppSelector((state: RootState) => state.userSettings.browse);
    const { data, error, isLoading } = useGetAlbumsQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumWall: {
            display: "grid",
            gap: coverGap,
            gridTemplateColumns: `repeat(auto-fit, ${coverSize}px)`,
            paddingBottom: 15,
        },
    }))();

    if (isLoading) {
        return (
            <Center>
                <Loader size="sm" />
                <Text size={14} weight="bold" pl={10}>
                    Retrieving albums...
                </Text>
            </Center>
        );
    }

    if (error) {
        return (
            <Center pt="xl">
                <SadLabel label="Could not retrieve album details" />
            </Center>
        );
    }

    if (!data || data.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Albums available" />
            </Center>
        );
    }

    const albumsToDisplay = data
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
        .sort((a, b) => (a.artist || "Various").localeCompare(b.artist || "Various"));

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

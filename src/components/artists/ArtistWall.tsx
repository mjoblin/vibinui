import React, { FC } from "react";
import { Box, Center, createStyles, Loader, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import { setFilteredAlbumCount, setFilteredTrackCount } from "../../app/store/internalSlice";
import ArtistCard from "./ArtistCard";
import SadLabel from "../shared/SadLabel";
import { useDebouncedValue } from "@mantine/hooks";

const ArtistWall: FC = () => {
    const dispatch = useAppDispatch();
    const { cardSize, cardGap, filterText } = useAppSelector(
        (state: RootState) => state.userSettings.artists
    );
    const [debouncedFilterText] = useDebouncedValue(filterText, 250);
    const { data: allArtists, error, isLoading } = useGetArtistsQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        artistWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    if (isLoading) {
        return (
            <Center>
                <Loader size="sm" />
                <Text size={14} weight="bold" pl={10}>
                    Retrieving artists...
                </Text>
            </Center>
        );
    }

    if (error) {
        return (
            <Center pt="xl">
                <SadLabel label="Could not retrieve artist details" />
            </Center>
        );
    }

    if (!allArtists || allArtists.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Artists available" />
            </Center>
        );
    }

    const artistsToDisplay = allArtists.filter((artist) => {
        if (debouncedFilterText === "") {
            return true;
        }

        const filterValueLower = debouncedFilterText.toLowerCase();

        return (
            // (track.artist || "Various").toLowerCase().includes(filterValueLower) ||
            artist.title.toLowerCase().includes(filterValueLower)
        );
    });

    dispatch(setFilteredTrackCount(artistsToDisplay.length));

    if (artistsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Tracks" />
            </Center>
        );
    }

    return (
        <Box className={dynamicClasses.artistWall}>
            {artistsToDisplay.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
            ))}
        </Box>
    );
};

export default ArtistWall;

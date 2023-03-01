import React, { FC, useState } from "react";
import {
    Box,
    Center,
    createStyles,
    Flex,
    Loader,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";

import { Artist } from "../../app/types";
import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import { setFilteredArtistCount } from "../../app/store/internalSlice";
import ArtistCard from "./ArtistCard";
import SadLabel from "../shared/SadLabel";
import { useMediaGroupings } from "../../app/hooks/useMediaGroupings";

const ArtistWall: FC = () => {
    const { colors } = useMantineTheme();
    const dispatch = useAppDispatch();
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.artists);
    const { cardSize, cardGap, filterText } = useAppSelector(
        (state: RootState) => state.userSettings.artists
    );
    const { data: allArtists, error, isLoading } = useGetArtistsQuery();
    const [selectedArtist, setSelectedArtist] = useState<string>("");
    const { allAlbumsByArtist, allTracksByArtist } = useMediaGroupings();

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
        if (filterText === "") {
            return true;
        }

        const filterValueLower = filterText.toLowerCase();

        return artist.title.toLowerCase().includes(filterValueLower);
    });

    dispatch(setFilteredArtistCount(artistsToDisplay.length));

    if (artistsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Tracks" />
            </Center>
        );
    }

    return viewMode === "simple" ? (
        <Box className={dynamicClasses.artistWall}>
            {artistsToDisplay
                .filter((artist) => artist.title.startsWith("H"))
                .map((artist) => (
                    <ArtistCard key={artist.id} type="simple" artist={artist} />
                ))}
        </Box>
    ) : (
        <Flex gap={20}>
            <Stack>
                <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                    Artist
                </Text>
                <Stack>
                    {artistsToDisplay.map((artist) => (
                        <ArtistCard
                            key={artist.id}
                            type="detailed"
                            artist={artist}
                            albums={allAlbumsByArtist(artist.title)}
                            tracks={allTracksByArtist(artist.title)}
                            onClick={(artist: Artist) => setSelectedArtist(artist.title)}
                        />
                    ))}
                </Stack>
            </Stack>

            <Stack>
                <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                    Albums
                </Text>
                <Stack>
                    {selectedArtist &&
                        allAlbumsByArtist(selectedArtist).map((album) => (
                            <Text>{album.title}</Text>
                        ))}
                </Stack>
            </Stack>

            <Stack>
                <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                    Tracks
                </Text>
                <Stack>{}</Stack>
            </Stack>
        </Flex>
    );
};

export default ArtistWall;

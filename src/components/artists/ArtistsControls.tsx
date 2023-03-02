import React, { FC, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Select,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    ArtistCollection,
    resetArtistsToDefaults,
    setArtistsActiveCollection,
    setArtistsFilterText,
    setArtistsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import GlowTitle from "../shared/GlowTitle";

const ArtistsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { activeCollection } = useAppSelector((state: RootState) => state.userSettings.artists);
    const { data: allArtists } = useGetArtistsQuery();
    const { filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.artists
    );
    const { filteredArtistCount } = useAppSelector((state: RootState) => state.internal.artists);

    return (
        <Flex gap={25} align="center">
            <GlowTitle>Artists</GlowTitle>

            {/* Filter text */}
            <TextInput
                placeholder="Filter text"
                label="Filter"
                value={filterText}
                onChange={(event) => dispatch(setArtistsFilterText(event.target.value))}
            />

            {/* Show all or just artists with albums */}
            <Select
                label="Show"
                miw="11rem"
                value={activeCollection}
                data={[
                    { value: "all", label: "All Artists" },
                    { value: "with_albums", label: "Artists with Albums" },
                ]}
                onChange={(value) =>
                    value && dispatch(setArtistsActiveCollection(value as ArtistCollection))
                }
            />

            <Box pt={8} sx={{ alignSelf: "center" }}>
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(event) => dispatch(setArtistsShowDetails(!showDetails))}
                />
            </Box>

            <Flex gap={10}>
                {/* Reset to defaults */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => dispatch(resetArtistsToDefaults())}
                    >
                        Reset
                    </Button>
                </Box>
            </Flex>

            {/* "Showing x of y artists" */}
            <Flex gap={3} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                <Text size="xs" color={colors.gray[6]}>
                    Showing
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {filteredArtistCount}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    of
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {allArtists?.length || 0}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    artists
                </Text>
            </Flex>
        </Flex>
    );
};

export default ArtistsControls;

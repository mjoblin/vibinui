import React, { FC } from "react";
import {
    Box,
    Button,
    Checkbox,
    createStyles,
    Flex,
    Select,
    Slider,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    minCardGap,
    maxCardGap,
    minCardSize,
    maxCardSize,
    resetArtistsToDefaults,
    setArtistsCardGap,
    setArtistsCardSize,
    setArtistsFilterText,
    setArtistsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import GlowTitle from "../shared/GlowTitle";

const ArtistsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { data: allArtists } = useGetArtistsQuery();
    const { cardSize, cardGap, filterText, showDetails } = useAppSelector(
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

            {/* Cover size */}
            <Stack spacing={5} pt={1}>
                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Art size
                </Text>
                <Slider
                    label={null}
                    min={minCardSize}
                    max={maxCardSize}
                    size={5}
                    sx={{ width: 200 }}
                    value={cardSize}
                    onChange={(value) => dispatch(setArtistsCardSize(value))}
                />
            </Stack>

            {/* Cover gap */}
            <Stack spacing={5} pt={1}>
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Separation
                </Text>
                <Slider
                    label={null}
                    min={minCardGap}
                    max={maxCardGap}
                    size={5}
                    sx={{ width: 200 }}
                    value={cardGap}
                    onChange={(value) => dispatch(setArtistsCardGap(value))}
                />
            </Stack>

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

                {/* Show a "tiny wall" preset */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => {
                            dispatch(setArtistsCardGap(minCardGap));
                            dispatch(setArtistsCardSize(minCardSize));
                            dispatch(setArtistsShowDetails(false));
                        }}
                    >
                        Tiny Wall
                    </Button>
                </Box>
            </Flex>

            {/* "Showing x of y albums" */}
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

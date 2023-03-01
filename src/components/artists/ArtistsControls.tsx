import React, { FC } from "react";
import {
    Box,
    Button, Center,
    Checkbox,
    createStyles,
    Flex, SegmentedControl,
    Select,
    Slider,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    MediaViewMode,
    minCardGap,
    maxCardGap,
    minCardSize,
    maxCardSize,
    resetArtistsToDefaults,
    setArtistsCardGap,
    setArtistsCardSize,
    setArtistsFilterText,
    setArtistsShowDetails,
    setArtistsViewMode,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import GlowTitle from "../shared/GlowTitle";
import { IconListDetails, IconMenu2 } from "@tabler/icons";

const ArtistsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.artists);
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

            {/* Playlist display options (simple vs. detailed) */}
            <SegmentedControl
                value={viewMode}
                radius={5}
                onChange={(value) =>
                    value && dispatch(setArtistsViewMode(value as MediaViewMode))
                }
                data={[
                    {
                        value: "simple",
                        label: (
                            <Center>
                                <IconMenu2 size={14} />
                                <Text size={14} ml={10}>
                                    Simple
                                </Text>
                            </Center>
                        ),
                    },
                    {
                        value: "detailed",
                        label: (
                            <Center>
                                <IconListDetails size={14} />
                                <Text size={14} ml={10}>
                                    Detailed
                                </Text>
                            </Center>
                        ),
                    },
                ]}
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

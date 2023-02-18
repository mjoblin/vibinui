import React, { FC } from "react";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Slider,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    minCoverGap,
    maxCoverGap,
    minCoverSize,
    maxCoverSize,
    resetBrowseToDefaults,
    setBrowseCoverGap,
    setBrowseCoverSize,
    setBrowseShowDetails,
    setFilterText,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetAlbumsQuery } from "../../app/services/vibinBase";

const BrowseControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { data: albums } = useGetAlbumsQuery();
    const { coverSize, coverGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.browse
    );
    const { filteredAlbumCount } = useAppSelector((state: RootState) => state.internal.browse);

    // TODO: Improve the alignment of these various controls. Currently there's a lot of hackery of
    //  the tops of components to get them to look OK.

    return (
        <Flex gap={25}>
            {/* Filter text */}
            <TextInput
                placeholder="Filter text"
                label="Filter"
                value={filterText}
                onChange={(event) => dispatch(setFilterText(event.target.value))}
            />

            {/* Cover size */}
            <Stack spacing={5} pt={1}>
                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Album size
                </Text>
                <Slider
                    label={null}
                    min={minCoverSize}
                    max={maxCoverSize}
                    size={5}
                    sx={{ width: 200 }}
                    value={coverSize}
                    onChange={(value) => dispatch(setBrowseCoverSize(value))}
                />
            </Stack>

            {/* Cover gap */}
            <Stack spacing={5} pt={1}>
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Separation
                </Text>
                <Slider
                    label={null}
                    min={minCoverGap}
                    max={maxCoverGap}
                    size={5}
                    sx={{ width: 200 }}
                    value={coverGap}
                    onChange={(value) => dispatch(setBrowseCoverGap(value))}
                />
            </Stack>

            <Box pt={8} sx={{ alignSelf: "center" }}>
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(event) => dispatch(setBrowseShowDetails(!showDetails))}
                />
            </Box>

            <Flex gap={10}>
                {/* Reset to defaults */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => dispatch(resetBrowseToDefaults())}
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
                            dispatch(setBrowseCoverGap(minCoverGap));
                            dispatch(setBrowseCoverSize(minCoverSize));
                            dispatch(setBrowseShowDetails(false));
                        }}
                    >
                        Tiny Wall
                    </Button>
                </Box>
            </Flex>

            {/* "Showing x of y albums" */}
            <Flex gap={3} justify="right" align="flex-end" sx={{ flexGrow: 1 }}>
                <Text size="xs" color={colors.gray[6]}>
                    Showing
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {filteredAlbumCount}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    of
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {albums?.length || 0}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    albums
                </Text>
            </Flex>
        </Flex>
    );
};

export default BrowseControls;

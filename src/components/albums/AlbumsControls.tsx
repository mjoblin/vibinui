import React, { FC } from "react";
import {
    Box,
    Button,
    Checkbox,
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
    AlbumCollection,
    minCoverGap,
    maxCoverGap,
    minCoverSize,
    maxCoverSize,
    resetAlbumsToDefaults,
    setAlbumsActiveCollection,
    setAlbumsCoverGap,
    setAlbumsCoverSize,
    setAlbumsFilterText,
    setAlbumsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";

const AlbumsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { data: allAlbums } = useGetAlbumsQuery();
    const { data: newAlbums } = useGetNewAlbumsQuery();
    const { activeCollection, coverSize, coverGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const { filteredAlbumCount } = useAppSelector((state: RootState) => state.internal.browse);

    // TODO: Improve the alignment of these various controls. Currently there's a lot of hackery of
    //  the tops of components to get them to look OK.

    return (
        <Flex gap={25} align="center">
            {/* Active collection */}
            <Select
                label="Show"
                value={activeCollection}
                data={[
                    { value: "all", label: "All Albums" },
                    { value: "new", label: "New Albums" },
                ]}
                onChange={(value) =>
                    value && dispatch(setAlbumsActiveCollection(value as AlbumCollection))
                }
            />

            {/* Filter text */}
            {/* TODO: Consider debouncing setAlbumsFilterText() if performance is an issue */}
            <TextInput
                placeholder="Filter text"
                label="Filter"
                value={filterText}
                onChange={(event) => dispatch(setAlbumsFilterText(event.target.value))}
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
                    onChange={(value) => dispatch(setAlbumsCoverSize(value))}
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
                    onChange={(value) => dispatch(setAlbumsCoverGap(value))}
                />
            </Stack>

            <Box pt={8} sx={{ alignSelf: "center" }}>
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(event) => dispatch(setAlbumsShowDetails(!showDetails))}
                />
            </Box>

            <Flex gap={10}>
                {/* Reset to defaults */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => dispatch(resetAlbumsToDefaults())}
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
                            dispatch(setAlbumsCoverGap(minCoverGap));
                            dispatch(setAlbumsCoverSize(minCoverSize));
                            dispatch(setAlbumsShowDetails(false));
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
                    {filteredAlbumCount}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    of
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {activeCollection === "all" ? allAlbums?.length || 0 : newAlbums?.length || 0}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    albums
                </Text>
            </Flex>
        </Flex>
    );
};

export default AlbumsControls;

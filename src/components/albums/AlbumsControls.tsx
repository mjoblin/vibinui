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
    minCardGap,
    maxCardGap,
    minCardSize,
    maxCardSize,
    resetAlbumsToDefaults,
    setAlbumsActiveCollection,
    setAlbumsCardGap,
    setAlbumsCardSize,
    setAlbumsFilterText,
    setAlbumsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import GlowTitle from "../shared/GlowTitle";

const AlbumsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { data: allAlbums } = useGetAlbumsQuery();
    const { data: newAlbums } = useGetNewAlbumsQuery();
    const { activeCollection, cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const { filteredAlbumCount } = useAppSelector((state: RootState) => state.internal.albums);

    // TODO: Improve the alignment of these various controls. Currently there's a lot of hackery of
    //  the tops of components to get them to look OK.

    return (
        <Flex gap={25} align="center">
            <GlowTitle>Albums</GlowTitle>

            {/* Active collection */}
            <Select
                label="Show"
                value={activeCollection}
                data={[
                    { value: "all", label: "All Albums" },
                    { value: "new", label: "New Albums" },
                    { value: "current", label: "Currently Playing" },
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
                    Art size
                </Text>
                <Slider
                    label={null}
                    min={minCardSize}
                    max={maxCardSize}
                    size={5}
                    sx={{ width: 200 }}
                    value={cardSize}
                    onChange={(value) => dispatch(setAlbumsCardSize(value))}
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
                    onChange={(value) => dispatch(setAlbumsCardGap(value))}
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
                            dispatch(setAlbumsCardGap(minCardGap));
                            dispatch(setAlbumsCardSize(minCardSize));
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
                    {activeCollection === "all"
                        ? allAlbums?.length || 0
                        : activeCollection === "new"
                        ? newAlbums?.length || 0
                        : allAlbums?.find((album) => album.id === currentAlbumMediaId) ? 1 : 0}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    albums
                </Text>
            </Flex>
        </Flex>
    );
};

export default AlbumsControls;

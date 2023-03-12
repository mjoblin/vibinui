import React, { FC } from "react";
import { Flex, Select, Text, TextInput, useMantineTheme } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    AlbumCollection,
    resetAlbumsToDefaults,
    setAlbumsActiveCollection,
    setAlbumsCardGap,
    setAlbumsCardSize,
    setAlbumsFilterText,
    setAlbumsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import CardControls from "../shared/CardControls";
import FilterInstructions from "../shared/FilterInstructions";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const AlbumsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppConstants();
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
        <Flex gap={25} align="flex-end">
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
                styles={STYLE_LABEL_BESIDE_COMPONENT}
            />

            {/* Filter text */}
            {/* TODO: Consider debouncing setAlbumsFilterText() if performance is an issue */}
            <Flex gap={10} align="center">
                <TextInput
                    placeholder="Filter by Album title"
                    label="Filter"
                    value={filterText}
                    onChange={(event) => dispatch(setAlbumsFilterText(event.target.value))}
                    styles={{
                        ...STYLE_LABEL_BESIDE_COMPONENT,
                        wrapper: {
                            width: CARD_FILTER_WIDTH,
                        },
                    }}
                />

                <FilterInstructions
                    defaultKey="title"
                    supportedKeys={["title", "artist", "creator", "genre", "date"]}
                    examples={["favorite album", "squirrels artist:(the rods) date:2004"]}
                />
            </Flex>

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y albums" */}
                <Flex gap={3} align="flex-end">
                    <Text size="xs" color={colors.gray[6]}>
                        Showing
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {filteredAlbumCount.toLocaleString()}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        of
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {activeCollection === "all"
                            ? allAlbums?.length.toLocaleString() || 0
                            : activeCollection === "new"
                            ? newAlbums?.length.toLocaleString() || 0
                            : allAlbums?.find((album) => album.id === currentAlbumMediaId)
                            ? 1
                            : 0}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        albums
                    </Text>
                </Flex>

                {/* Card display settings */}
                <CardControls
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    cardSizeSetter={setAlbumsCardSize}
                    cardGapSetter={setAlbumsCardGap}
                    showDetailsSetter={setAlbumsShowDetails}
                    resetter={resetAlbumsToDefaults}
                />
            </Flex>
        </Flex>
    );
};

export default AlbumsControls;

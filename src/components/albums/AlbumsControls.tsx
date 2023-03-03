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
import GlowTitle from "../shared/GlowTitle";
import CardControls from "../shared/CardControls";

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
                miw="20rem"
                value={filterText}
                onChange={(event) => dispatch(setAlbumsFilterText(event.target.value))}
            />

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y albums" */}
                <Flex gap={3} align="flex-end">
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

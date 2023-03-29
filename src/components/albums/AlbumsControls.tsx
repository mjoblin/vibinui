import React, { FC } from "react";
import { ActionIcon, Box, Flex, Select, Text, TextInput, useMantineTheme } from "@mantine/core";
import { IconSquareX } from "@tabler/icons";

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
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import ShowCountLabel from "../shared/ShowCountLabel";
import PlayMediaIdsButton from "../shared/PlayMediaIdsButton";
import CurrentlyPlayingButton from "../shared/CurrentlyPlayingButton";

type AlbumsControlsProps = {
    scrollToCurrent?: () => void;
}

const AlbumsControls: FC<AlbumsControlsProps> = ({ scrollToCurrent }) => {
    const dispatch = useAppDispatch();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { data: allAlbums } = useGetAlbumsQuery();
    const { data: newAlbums } = useGetNewAlbumsQuery();
    const { activeCollection, cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const { filteredAlbumMediaIds } = useAppSelector((state: RootState) => state.internal.albums);

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
                styles={{
                    ...STYLE_LABEL_BESIDE_COMPONENT,
                    input: {
                        width: 170,
                    },
                }}
            />

            {/* Filter text */}
            {/* TODO: Consider debouncing setAlbumsFilterText() if performance is an issue */}
            <Flex gap={10} align="center">
                <TextInput
                    placeholder="Title filter, or advanced"
                    label="Filter"
                    value={filterText}
                    rightSection={
                        <ActionIcon
                            disabled={!filterText}
                            onClick={() => dispatch(setAlbumsFilterText(""))}
                        >
                            <IconSquareX size="1.3rem" style={{ display: "block", opacity: 0.5 }} />
                        </ActionIcon>
                    }
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

            <Flex align="center" gap={10}>
                <CurrentlyPlayingButton
                    disabled={activeCollection !== "all" || filterText !== ""}
                    tooltipLabel="Show currently playing Album"
                    onClick={() => scrollToCurrent && scrollToCurrent()}
                />

                <PlayMediaIdsButton
                    mediaIds={filteredAlbumMediaIds}
                    disabled={filterText === ""}
                    tooltipLabel={`Replace Playlist with ${
                        filteredAlbumMediaIds.length < (allAlbums?.length || 0)
                            ? filteredAlbumMediaIds.length.toLocaleString()
                            : ""
                    } filtered Albums (10 max)`}
                    menuItemLabel="Replace Playlist with filtered Albums"
                    notificationLabel={`Playlist replaced with ${filteredAlbumMediaIds.length.toLocaleString()} filtered Albums`}
                    maxToPlay={10}
                />
            </Flex>

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y albums" */}
                <ShowCountLabel
                    showing={filteredAlbumMediaIds.length}
                    of={
                        activeCollection === "all"
                            ? allAlbums?.length || 0
                            : activeCollection === "new"
                            ? newAlbums?.length || 0
                            : allAlbums?.find((album) => album.id === currentAlbumMediaId)
                            ? 1
                            : 0
                    }
                    type="albums"
                />

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

import React, { FC, useEffect, useState } from "react";
import { ActionIcon, Flex, Select, TextInput } from "@mantine/core";
import { IconSquareX } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import {
    AlbumCollection,
    setAlbumsActiveCollection,
    setAlbumsFilterText,
    setAlbumsFollowCurrentlyPlaying,
} from "../../../app/store/userSettingsSlice";
import { RootState } from "../../../app/store/store";
import { useGetAlbumsQuery } from "../../../app/services/vibinAlbums";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaWallDisplayControls from "../../shared/buttons/MediaWallDisplayControls";
import FilterInstructions from "../../shared/textDisplay/FilterInstructions";
import ShowCountLabel from "../../shared/textDisplay/ShowCountLabel";
import PlayMediaIdsButton from "../../shared/buttons/PlayMediaIdsButton";
import CurrentlyPlayingButton from "../../shared/buttons/CurrentlyPlayingButton";
import FollowCurrentlyPlayingToggle from "../../shared/buttons/FollowCurrentlyPlayingToggle";

// ================================================================================================
// Controls for the <AlbumsWall>.
//
// Contains:
//  - Filter input
//  - Button to scroll to currently-playing Album
//  - Toggle to follow currently-playing Album
//  - Play filtered Albums
//  - Card controls
// ================================================================================================

type AlbumsControlsProps = {
    scrollToCurrent?: () => void;
}

const AlbumsControls: FC<AlbumsControlsProps> = ({ scrollToCurrent }) => {
    const dispatch = useAppDispatch();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { data: allAlbums } = useGetAlbumsQuery();
    const { activeCollection, filterText, followCurrentlyPlaying } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const { filteredAlbumMediaIds } = useAppSelector((state: RootState) => state.internal.albums);
    const [currentIsShown, setCurrentIsShown] = useState<boolean>(false);

    /**
     * Auto-scroll to the current entry when the current entry changes, and if the "follow" feature
     * is enabled. The goal is to keep the current entry near the top of the playlist while the
     * playlist screen remains open.
     */
    useEffect(() => {
        followCurrentlyPlaying &&
            currentAlbumMediaId &&
            scrollToCurrent &&
            setTimeout(() => scrollToCurrent(), 1);
    }, [followCurrentlyPlaying, currentAlbumMediaId, scrollToCurrent]);

    /**
     * Disable following the currently-playing album if an incomplete list of albums be currently
     * being displayed (e.g. a filter is active).
     */
    useEffect(() => {
        if (activeCollection !== "all" || filterText !== "") {
            dispatch(setAlbumsFollowCurrentlyPlaying(false));
        }
    }, [activeCollection, filterText, dispatch]);

    /**
     * Keep track of whether the currently-playing album is in the list of albums being displayed.
     */
    useEffect(
        () =>
            setCurrentIsShown(
                !!(currentAlbumMediaId && filteredAlbumMediaIds.includes(currentAlbumMediaId))
            ),
        [currentAlbumMediaId, filteredAlbumMediaIds]
    );
    
    // --------------------------------------------------------------------------------------------

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
            <Flex gap={10} align="center" sx={{ flexGrow: 1 }}>
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
                        root: {
                            ...STYLE_LABEL_BESIDE_COMPONENT.root,
                            flexGrow: 1,
                        },
                        wrapper: {
                            flexGrow: 1,
                        },
                    }}
                />

                <FilterInstructions
                    defaultKey="title"
                    supportedKeys={["title", "artist", "creator", "genre", "date"]}
                    examples={["favorite album", "squirrels artist:(the rods) date:2004"]}
                />
            </Flex>

            {/* Buttons to show and follow currently-playing */}
            <Flex align="center" gap={5}>
                <CurrentlyPlayingButton
                    disabled={!currentIsShown}
                    tooltipLabel="Show currently playing Album"
                    onClick={() => scrollToCurrent && scrollToCurrent()}
                />

                <FollowCurrentlyPlayingToggle
                    isOn={followCurrentlyPlaying}
                    disabled={!currentIsShown}
                    tooltipLabel="Follow currently playing Album"
                    onClick={() =>
                        dispatch(setAlbumsFollowCurrentlyPlaying(!followCurrentlyPlaying))
                    }
                />
            </Flex>

            {/* Play the currently-filtered albums */}
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

            <Flex gap={20} justify="right" align="center">
                {/* "Showing x of y albums" */}
                <ShowCountLabel
                    showing={filteredAlbumMediaIds.length}
                    of={allAlbums?.length || 0}
                    type="albums"
                />

                {/* Card display settings */}
                <MediaWallDisplayControls applicationFeature="albums" />
            </Flex>
        </Flex>
    );
};

export default AlbumsControls;

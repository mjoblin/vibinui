import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import { Box, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import {
    IconArrowBarToDown,
    IconArrowBarToUp,
    IconCornerDownRightDouble,
    IconDisc,
    IconDotsVertical,
    IconHeart,
    IconHeartOff,
    IconMicrophone2,
    IconPlayerPlay,
    IconTrash
} from "@tabler/icons";

import { PlaylistEntry, Track } from "../../app/types";
import {
    useDeletePlaylistEntryIdMutation,
    useMovePlaylistEntryIdMutation,
    usePlayPlaylistEntryIdMutation,
} from "../../app/services/vibinPlaylist";
import {
    useAddFavoriteMutation,
    useDeleteFavoriteMutation,
} from "../../app/services/vibinFavorites";
import { showErrorNotification, showSuccessNotification } from "../../app/utils";
import {
    setAlbumsActiveCollection,
    setAlbumsFilterText,
    setArtistsActiveCollection,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack
} from "../../app/store/userSettingsSlice";
import {
    setArtistsScrollToCurrentOnScreenEnter,
    setArtistsScrollToSelectedOnScreenEnter
} from "../../app/store/internalSlice";
import { setTracksFilterText } from "../../app/store/userSettingsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

const useStyles = createStyles((theme) => ({
    button: {
        transition: "color .2s ease-in-out",
        "&:hover": {
            color: theme.colors.gray[1],
            cursor: "pointer",
        },
    },
}));

const useMenuStyles = createStyles((theme) => ({
    item: {
        fontSize: 12,
        padding: "7px 12px",
        "&[data-hovered]": {
            backgroundColor: theme.colors[theme.primaryColor][theme.fn.primaryShade()],
            color: theme.white,
        },
    },
}));

type PlaylistEntryActionsButtonProps = {
    entry: PlaylistEntry;
    entryCount: number;
    currentlyPlayingIndex: number | undefined;
    onOpen?: () => void;
    onClose?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const PlaylistEntryActionsButton: FC<PlaylistEntryActionsButtonProps> = ({
    entry,
    entryCount,
    currentlyPlayingIndex = undefined,
    onOpen = undefined,
    onClose = undefined,
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { colors } = useMantineTheme();
    const [moveEntry, moveEntryStatus] = useMovePlaylistEntryIdMutation();
    const [deletePlaylistId, deleteStatus] = useDeletePlaylistEntryIdMutation();
    const [addFavorite, addFavoriteStatus] = useAddFavoriteMutation();
    const [deleteFavorite, deleteFavoriteStatus] = useDeleteFavoriteMutation();
    const [playPlaylistId, playStatus] = usePlayPlaylistEntryIdMutation();
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const artistByName = useAppSelector((state: RootState) => state.mediaGroups.artistByName);
    const albumById = useAppSelector((state: RootState) => state.mediaGroups.albumById);
    const trackById = useAppSelector((state: RootState) => state.mediaGroups.trackById);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    // For notifications, we assume that any playlist changes are successful. If we do get some
    // sort of error though then a second notification is created. This is done instead of
    // attempting to track the success/fail state of each playlist update separately and modifying
    // the update's notification to reflect success/fail.

    useEffect(() => {
        if (moveEntryStatus.isError || deleteStatus.isError || playStatus.isError) {
            const { status, data } = moveEntryStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title:
                    moveEntryStatus.isError || deleteStatus.isError
                        ? "Error updating Playlist"
                        : "Error playing Entry",
                message: `[${status}] ${data}`,
            });
        }
    }, [moveEntryStatus, deleteStatus, playStatus]);

    const isFavorited = !!favorites.find((favorite) => favorite.media_id === entry.trackMediaId);

    return (
        <Box>
            <Menu
                classNames={menuStyles.classes}
                position="top"
                withinPortal={true}
                withArrow
                onOpen={() => {
                    setIsActionsMenuOpen(true);
                    onOpen && onOpen();
                }}
                onClose={() => {
                    setIsActionsMenuOpen(false);
                    onClose && onClose();
                }}
                // TODO: Setting zIndex to ensure it renders over the Nav bar; find better approach
                zIndex={999}
            >
                <Menu.Target>
                    <Tooltip label="Entry actions" disabled={isActionsMenuOpen}>
                        <Box pt={4} className={classes.button}>
                            <IconDotsVertical size={15} />
                        </Box>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    <>
                        {/* General actions --------------------------------------------------- */}

                        <Menu.Label>General</Menu.Label>
                        <Menu.Item
                            icon={<IconPlayerPlay size={14} fill={colors.gray[3]} />}
                            onClick={() => {
                                playPlaylistId({ playlistId: entry.id });
                            }}
                        >
                            Play now
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconTrash size={14} />}
                            onClick={() => {
                                deletePlaylistId({ playlistId: entry.id });

                                showSuccessNotification({
                                    title: "Entry removed from Playlist",
                                    message: entry.title,
                                });
                            }}
                        >
                            Remove from Playlist
                        </Menu.Item>

                        {/* Move actions ------------------------------------------------------ */}

                        <Menu.Label>Move</Menu.Label>
                        <Menu.Item
                            icon={<IconArrowBarToUp size={14} />}
                            onClick={() => {
                                moveEntry({
                                    playlistId: entry.id,
                                    fromIndex: entry.index,
                                    toIndex: 0,
                                });

                                showSuccessNotification({
                                    title: "Entry moved to top of Playlist",
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to top
                        </Menu.Item>
                        <Menu.Item
                            disabled={!currentlyPlayingIndex}
                            icon={<IconCornerDownRightDouble size={14} />}
                            onClick={() => {
                                if (!currentlyPlayingIndex) {
                                    return;
                                }

                                const newIndex = currentlyPlayingIndex + 1;

                                moveEntry({
                                    playlistId: entry.id,
                                    fromIndex: entry.index,
                                    toIndex: newIndex,
                                });

                                showSuccessNotification({
                                    title: `Entry moved to play next (#${newIndex + 1})`,
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to Play next
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconArrowBarToDown size={12} />}
                            onClick={() => {
                                moveEntry({
                                    playlistId: entry.id,
                                    fromIndex: entry.index,
                                    toIndex: entryCount - 1,
                                });

                                showSuccessNotification({
                                    title: "Entry moved to bottom of Playlist",
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to bottom
                        </Menu.Item>

                        {/* Favorites actions ------------------------------------------------- */}

                        <Menu.Label>Favorites</Menu.Label>
                        <Menu.Item
                            icon={<IconHeart size={14} />}
                            disabled={isFavorited}
                            onClick={() => {
                                addFavorite({ type: "track", mediaId: entry.trackMediaId });

                                showSuccessNotification({
                                    title: "Track added to Favorites",
                                    message: entry.title,
                                });
                            }}
                        >
                            Add to Favorites
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconHeartOff size={14} />}
                            disabled={!isFavorited}
                            onClick={() => {
                                deleteFavorite({ mediaId: entry.trackMediaId });

                                showSuccessNotification({
                                    title: "Track removed from Favorites",
                                    message: entry.title,
                                });
                            }}
                        >
                            Remove from Favorites
                        </Menu.Item>

                        {/* Navigation actions ------------------------------------------------ */}

                        <Menu.Label>Navigation</Menu.Label>
                        <Menu.Item
                            icon={<IconDisc size={14} />}
                            onClick={() => {
                                dispatch(setArtistsActiveCollection("all"));
                                dispatch(setArtistsSelectedArtist(artistByName[entry.artist]));
                                dispatch(setArtistsSelectedAlbum(albumById[entry.albumMediaId]));
                                dispatch(setArtistsSelectedTrack(trackById[entry.trackMediaId]));

                                if (entry.index === currentlyPlayingIndex) {
                                    dispatch(setArtistsScrollToCurrentOnScreenEnter(true));
                                }
                                else {
                                    dispatch(setArtistsScrollToSelectedOnScreenEnter(true));
                                }

                                navigate("/ui/artists");
                            }}
                        >
                            View in Artists
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconDisc size={14} />}
                            onClick={() => {
                                dispatch(setAlbumsActiveCollection("all"));
                                dispatch(
                                    setAlbumsFilterText(`${entry.album} artist:(${entry.artist})`)
                                );
                                navigate("/ui/albums");
                            }}
                        >
                            View in Albums
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconMicrophone2 size={14} />}
                            onClick={() => {
                                dispatch(
                                    setTracksFilterText(`${entry.title} album:(${entry.album})`)
                                );
                                navigate("/ui/tracks");
                            }}
                        >
                            View in Tracks
                        </Menu.Item>
                    </>
                </Menu.Dropdown>
            </Menu>
        </Box>
    );
};

export default PlaylistEntryActionsButton;

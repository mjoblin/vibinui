import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import {
    IconCornerDownRight,
    IconCornerDownRightDouble,
    IconDotsVertical, IconHeart, IconHeartOff,
    IconPlayerPlay,
    IconPlaylistAdd,
} from "@tabler/icons";

import { Track } from "../../app/types";
import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { showErrorNotification, showSuccessNotification } from "../../app/utils";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import { useAddFavoriteMutation, useDeleteFavoriteMutation } from "../../app/services/vibinFavorites";

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
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
    // TODO: See if the pointerOnHover CSS can be defined here, since it's menu-specific. Note that
    //  trying to define a "target" key did not result in the desired behavior.
}));

type TrackActionsButtonProps = {
    track: Track;
    onOpen?: () => void;
    onClose?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const TrackActionsButton: FC<TrackActionsButtonProps> = ({
    track,
    onOpen = undefined,
    onClose = undefined,
}) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [addFavorite, addFavoriteStatus] = useAddFavoriteMutation();
    const [deleteFavorite, deleteFavoriteStatus] = useDeleteFavoriteMutation();
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { colors } = useMantineTheme();
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    // For notifications, we assume that any playlist changes are successful. If we do get some
    // sort of error though then a second notification is created. This is done instead of
    // attempting to track the success/fail state of each playlist update separately and modifying
    // the update's notification to reflect success/fail.

    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Error updating Playlist",
                message: `[${status}] ${data}`,
            });
        }
    }, [addStatus]);

    const isFavorited = !!favorites.find((favorite) => favorite.media_id === track.id);
    const isStreamerOff = streamerPower === "off";

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
            >
                <Menu.Target>
                    <Tooltip label="Track actions" disabled={isActionsMenuOpen}>
                        <Box pt={4} className={classes.pointerOnHover}>
                            <IconDotsVertical size={15} />
                        </Box>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    <>
                        {/* Playlist */}
                        <Menu.Label>Playlist</Menu.Label>
                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconPlayerPlay size={14} fill={colors.gray[5]} />}
                            onClick={() => {
                                addMediaToPlaylist({
                                    mediaId: track.id!!,
                                    action: "REPLACE",
                                });

                                showSuccessNotification({
                                    title: "Replaced Playlist with Track",
                                    message: track.title,
                                });
                            }}
                        >
                            Replace and play now
                        </Menu.Item>
                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconCornerDownRight size={14} />}
                            onClick={() => {
                                addMediaToPlaylist({
                                    mediaId: track.id!!,
                                    action: "PLAY_NOW",
                                });

                                showSuccessNotification({
                                    title: "Track inserted into Playlist and now playing",
                                    message: track.title,
                                });
                            }}
                        >
                            Insert and play now
                        </Menu.Item>
                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconCornerDownRightDouble size={14} />}
                            onClick={() => {
                                addMediaToPlaylist({
                                    mediaId: track.id!!,
                                    action: "PLAY_NEXT",
                                });

                                showSuccessNotification({
                                    title: "Track inserted next in Playlist",
                                    message: track.title,
                                });
                            }}
                        >
                            Insert and play next
                        </Menu.Item>
                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconPlaylistAdd size={14} />}
                            onClick={() => {
                                addMediaToPlaylist({ mediaId: track.id!!, action: "APPEND" });

                                showSuccessNotification({
                                    title: "Track appended to end of Playlist",
                                    message: track.title,
                                });
                            }}
                        >
                            Append to end
                        </Menu.Item>

                        {/* Favorites */}
                        <Menu.Label>Favorites</Menu.Label>
                        <Menu.Item
                            icon={<IconHeart size={14} />}
                            disabled={isFavorited}
                            onClick={() => {
                                addFavorite({ type: "track", mediaId: track.id });

                                showSuccessNotification({
                                    title: "Track added to Favorites",
                                    message: track.title,
                                });
                            }}
                        >
                            Add to Favorites
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconHeartOff size={14} />}
                            disabled={!isFavorited}
                            onClick={() => {
                                deleteFavorite({ mediaId: track.id });

                                showSuccessNotification({
                                    title: "Track removed from Favorites",
                                    message: track.title,
                                });
                            }}
                        >
                            Remove from Favorites
                        </Menu.Item>
                    </>
                </Menu.Dropdown>
            </Menu>
        </Box>
    );
};

export default TrackActionsButton;

import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
    IconArrowBarToDown,
    IconArrowBarToUp,
    IconDotsVertical,
    IconPlayerPlay,
    IconTrash
} from "@tabler/icons";

import { PlaylistEntry } from "../../app/types";
import {
    useDeletePlaylistEntryIdMutation,
    useMovePlaylistEntryIdMutation,
    usePlayPlaylistEntryIdMutation,
} from "../../app/services/vibinPlaylist";

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
    const { colors } = useMantineTheme();
    const [moveEntry, moveEntryStatus] = useMovePlaylistEntryIdMutation();
    const [deletePlaylistId, deleteStatus] = useDeletePlaylistEntryIdMutation();
    const [playPlaylistId, playStatus] = usePlayPlaylistEntryIdMutation();
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

            showNotification({
                title:
                    moveEntryStatus.isError || deleteStatus.isError
                        ? "Error updating Playlist"
                        : "Error playing Entry",
                message: `[${status}] ${data}`,
            });
        }
    }, [moveEntryStatus, deleteStatus, playStatus]);

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
                        <Menu.Label>General</Menu.Label>
                        <Menu.Item
                            icon={<IconPlayerPlay size={12} fill={colors.gray[5]} />}
                            onClick={() => {
                                playPlaylistId({ playlistId: entry.id });
                            }}
                        >
                            Play now
                        </Menu.Item>
                        <Menu.Item
                            icon={<IconTrash size={12} />}
                            onClick={() => {
                                deletePlaylistId({ playlistId: entry.id });

                                showNotification({
                                    title: "Entry removed from Playlist",
                                    message: entry.title,
                                });
                            }}
                        >
                            Remove from Playlist
                        </Menu.Item>

                        <Menu.Label>Move</Menu.Label>
                        <Menu.Item
                            icon={<IconArrowBarToUp size={12} />}
                            onClick={() => {
                                moveEntry({
                                    playlistId: entry.id,
                                    fromIndex: entry.index,
                                    toIndex: 0,
                                });

                                showNotification({
                                    title: `Entry moved to top of Playlist`,
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to top
                        </Menu.Item>
                        <Menu.Item
                            disabled={!currentlyPlayingIndex}
                            icon={<IconPlayerPlay size={12} />}
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

                                showNotification({
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

                                showNotification({
                                    title: "Entry moved to bottom of Playlist",
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to bottom
                        </Menu.Item>
                    </>
                </Menu.Dropdown>
            </Menu>
        </Box>
    );
};

export default PlaylistEntryActionsButton;

import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Menu, Tooltip } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDotsVertical } from "@tabler/icons";

import { Track } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";

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
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    // For notifications, we assume that any playlist changes are successful. If we do get some
    // sort of error though then a second notification is created. This is done instead of
    // attempting to track the success/fail state of each playlist update separately and modifying
    // the update's notification to reflect success/fail.

    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error updating Playlist",
                message: `[${status}] ${data}`,
            });
        }
    }, [addStatus]);

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
                    <Tooltip
                        label="Track actions"
                        color="blue"
                        disabled={isActionsMenuOpen}
                        openDelay={500}
                        withArrow
                        arrowSize={8}
                        styles={{ tooltip: { fontSize: 12 } }}
                    >
                        <Box pt={4} className={classes.pointerOnHover}>
                            <IconDotsVertical size={15} />
                        </Box>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    {/* Playlist */}
                    <>
                        <Menu.Label>Playlist</Menu.Label>
                        <Menu.Item
                            onClick={() => {
                                addMediaToPlaylist({
                                    mediaId: track.id!!,
                                    action: "REPLACE",
                                });

                                showNotification({
                                    title: `Replaced Playlist with Track`,
                                    message: track.title,
                                });
                            }}
                        >
                            Replace and play now
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                addMediaToPlaylist({
                                    mediaId: track.id!!,
                                    action: "PLAY_NOW",
                                });

                                showNotification({
                                    title: `Track inserted into Playlist and now playing`,
                                    message: track.title,
                                });
                            }}
                        >
                            Insert and play now
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                addMediaToPlaylist({
                                    mediaId: track.id!!,
                                    action: "PLAY_NEXT",
                                });

                                showNotification({
                                    title: `Track inserted next in Playlist`,
                                    message: track.title,
                                });
                            }}
                        >
                            Insert and play next
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                addMediaToPlaylist({ mediaId: track.id!!, action: "APPEND" });

                                showNotification({
                                    title: `Track appended to end of Playlist`,
                                    message: track.title,
                                });
                            }}
                        >
                            Append to end
                        </Menu.Item>
                    </>
                </Menu.Dropdown>
            </Menu>
        </Box>
    );
};

export default TrackActionsButton;

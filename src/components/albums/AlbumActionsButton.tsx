import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, Center, createStyles, Menu, Tooltip } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import { showNotification } from "@mantine/notifications";
import { IconDotsVertical } from "@tabler/icons";

import { Album } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import AlbumTracksModal from "../tracks/AlbumTracksModal";

export type AlbumActionCategory = "Tracks" | "Playlist";

const useStyles = createStyles((theme) => ({
    actionsButtonContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgb(255, 255, 255, 0.2)",
        transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
        "&:hover": {
            cursor: "pointer",
            backgroundColor: theme.colors.blue,
        },
    },
    buttonActive: {
        backgroundColor: theme.colors.blue,
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

type AlbumActionsButtonProps = {
    album: Album;
    categories?: AlbumActionCategory[];
    position?: FloatingPosition;
    onOpen?: () => void;
    onClose?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const AlbumActionsButton: FC<AlbumActionsButtonProps> = ({
    album,
    categories = ["Tracks", "Playlist"],
    position = "top",
    onOpen = undefined,
    onClose = undefined,
}) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error updating Playlist",
                message: `[${status}] ${data}`,
                autoClose: false,
            });
        }
    }, [addStatus]);

    return (
        <Box onClick={(event) => event.stopPropagation()}>
            <Menu
                classNames={menuStyles.classes}
                position={position}
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
                    {/* TODO: Not using <VibinTooltip> until it supports forwarded refs */}
                    <Tooltip
                        label="Album actions"
                        color="blue"
                        disabled={isActionsMenuOpen}
                        openDelay={500}
                        withArrow
                        arrowSize={8}
                        styles={{ tooltip: { fontSize: 12 } }}
                    >
                        <Center
                            className={`${classes.actionsButtonContainer} ${
                                isActionsMenuOpen && classes.buttonActive
                            }`}
                        >
                            <Box pt={2}>
                                <IconDotsVertical size={15} />
                            </Box>
                        </Center>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    {/* Tracks */}
                    {categories.includes("Tracks") && (
                        <>
                            <Menu.Label>Tracks</Menu.Label>
                            <Menu.Item onClick={() => setShowTracksModal(true)}>
                                View tracks
                            </Menu.Item>
                        </>
                    )}

                    {/* Playlist */}
                    {categories.includes("Playlist") && (
                        <>
                            <Menu.Label>Playlist</Menu.Label>
                            <Menu.Item
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: album.id,
                                        action: "REPLACE",
                                    });

                                    showNotification({
                                        title: `Replaced Playlist with Album`,
                                        message: album.title,
                                    });
                                }}
                            >
                                Replace and play now
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: album.id,
                                        action: "PLAY_NOW",
                                    });

                                    showNotification({
                                        title: `Album inserted into Playlist and now playing`,
                                        message: album.title,
                                    });
                                }}
                            >
                                Insert and play now
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: album.id,
                                        action: "PLAY_NEXT",
                                    });

                                    showNotification({
                                        title: `Album inserted next in Playlist`,
                                        message: album.title,
                                    });
                                }}
                            >
                                Insert and play next
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    addMediaToPlaylist({ mediaId: album.id, action: "APPEND" });

                                    showNotification({
                                        title: `Album appended to end of Playlist`,
                                        message: album.title,
                                    });
                                }}
                            >
                                Append to end
                            </Menu.Item>
                        </>
                    )}
                </Menu.Dropdown>

                {/* Track list modal */}
                <AlbumTracksModal
                    album={album}
                    opened={showTracksModal}
                    onClose={() => setShowTracksModal(false)}
                />
            </Menu>
        </Box>
    );
};

export default AlbumActionsButton;

import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, Center, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import {
    IconCornerDownRight,
    IconCornerDownRightDouble,
    IconDotsVertical,
    IconList,
    IconPlayerPlay,
    IconPlaylistAdd,
} from "@tabler/icons";

import { Album, Track } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import AlbumTracksModal from "../tracks/AlbumTracksModal";
import { showErrorNotification, showSuccessNotification } from "../../app/utils";

export type MediaType = "album" | "track";
export type ActionCategory = "Tracks" | "Playlist";

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

type MediaActionsButtonProps = {
    mediaType: MediaType; // TODO: Can "mediaType" be replaced with type checking on "media".
    media: Album | Track;
    categories?: ActionCategory[];
    position?: FloatingPosition;
    onOpen?: () => void;
    onClose?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const MediaActionsButton: FC<MediaActionsButtonProps> = ({
    mediaType,
    media,
    categories = ["Tracks", "Playlist"],
    position = "top",
    onOpen = undefined,
    onClose = undefined,
}) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { colors } = useMantineTheme();
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Error updating Playlist",
                message: `[${status}] ${data}`,
            });
        }
    }, [addStatus]);

    const mediaTypeDisplay = mediaType && mediaType[0].toUpperCase() + mediaType.slice(1);

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
                        label={`${mediaTypeDisplay} actions`}
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
                    {mediaType === "album" && categories.includes("Tracks") && (
                        <>
                            <Menu.Label>Tracks</Menu.Label>
                            <Menu.Item
                                icon={<IconList size={14} />}
                                onClick={() => setShowTracksModal(true)}
                            >
                                View tracks
                            </Menu.Item>
                        </>
                    )}

                    {/* Playlist */}
                    {categories.includes("Playlist") && (
                        <>
                            <Menu.Label>Playlist</Menu.Label>
                            <Menu.Item
                                icon={<IconPlayerPlay size={14} fill={colors.gray[5]} />}
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: media.id,
                                        action: "REPLACE",
                                    });

                                    showSuccessNotification({
                                        title: `Replaced Playlist with ${mediaTypeDisplay}`,
                                        message: media.title,
                                    });
                                }}
                            >
                                Replace and play now
                            </Menu.Item>
                            <Menu.Item
                                icon={<IconCornerDownRight size={14} />}
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: media.id,
                                        action: "PLAY_NOW",
                                    });

                                    showSuccessNotification({
                                        title: `${mediaTypeDisplay} inserted into Playlist and now playing`,
                                        message: media.title,
                                    });
                                }}
                            >
                                Insert and play now
                            </Menu.Item>
                            <Menu.Item
                                icon={<IconCornerDownRightDouble size={14} />}
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: media.id,
                                        action: "PLAY_NEXT",
                                    });

                                    showSuccessNotification({
                                        title: `${mediaTypeDisplay} inserted next in Playlist`,
                                        message: media.title,
                                    });
                                }}
                            >
                                Insert and play next
                            </Menu.Item>
                            <Menu.Item
                                icon={<IconPlaylistAdd size={12} />}
                                onClick={() => {
                                    addMediaToPlaylist({ mediaId: media.id, action: "APPEND" });

                                    showSuccessNotification({
                                        title: `${mediaTypeDisplay} appended to end of Playlist`,
                                        message: media.title,
                                    });
                                }}
                            >
                                Append to end
                            </Menu.Item>
                        </>
                    )}
                </Menu.Dropdown>

                {mediaType === "album" && (
                    // Track list modal
                    <AlbumTracksModal
                        album={media as Album}
                        opened={showTracksModal}
                        onClose={() => setShowTracksModal(false)}
                    />
                )}
            </Menu>
        </Box>
    );
};

export default MediaActionsButton;

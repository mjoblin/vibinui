import React, { FC, useState } from "react";
import { Box, createStyles, Menu, Modal } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons";

import { Album } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import AlbumTracks from "../tracks/AlbumTracks";

export type AlbumActionCategory = "Tracks" | "Playlist";

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

type AlbumProps = {
    album: Album;
    categories?: AlbumActionCategory[];
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const AlbumActions: FC<AlbumProps> = ({ album, categories = ["Tracks", "Playlist"] }) => {
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
    const [addMediaToPlaylist] = useAddMediaToPlaylistMutation();
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    return (
        <Box>
            <Menu classNames={menuStyles.classes} position="top" withinPortal={true} withArrow>
                <Menu.Target>
                    <Box className={classes.pointerOnHover}>
                        <IconDotsVertical size={15} />
                    </Box>
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
                                    addMediaToPlaylist({ mediaId: album.id, action: "APPEND" });
                                }}
                            >
                                Append to end
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    addMediaToPlaylist({
                                        mediaId: album.id,
                                        action: "REPLACE",
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
                                }}
                            >
                                Insert and play next
                            </Menu.Item>
                        </>
                    )}
                </Menu.Dropdown>
            </Menu>

            {/* Tracks modal */}
            <Modal
                title="Album Details"
                centered
                opened={showTracksModal}
                onClose={() => setShowTracksModal(false)}
            >
                <AlbumTracks album={album} />
            </Modal>
        </Box>
    );
};

export default AlbumActions;

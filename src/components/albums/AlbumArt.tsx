import React, { FC, useState } from "react";
import { Box, createStyles, Flex, Image } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { Album } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import AlbumActionsButton from "./AlbumActionsButton";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import VibinIconButton from "../shared/VibinIconButton";

const useStyles = createStyles((theme) => ({
    albumArtContainer: {
        position: "relative",
    },
    actionsMenuActive: {
        opacity: 1,
    },
    albumControls: {
        position: "absolute",
        // width: size,
        // height: size,
        top: 0,
        left: 0,
        opacity: 0,
        transition: "transform .2s ease-in-out, opacity .2s ease-in-out",
        "&:hover": {
            opacity: 1,
        },
    },
}));

type AlbumArtProps = {
    album?: Album;
    artUri?: string;
    alt?: string;
    radius?: number;
    showControls?: boolean;
    size?: number;
    showArtStub?: boolean;
    actionsMenuPosition?: FloatingPosition;
    onActionsMenuOpen?: () => void;
    onActionsMenuClosed?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

/**
 *
 * Either `album` or `artUri` should be passed.
 *
 * @param album
 * @param artUri
 * @param alt
 * @param radius
 * @param showControls
 * @param size
 * @param showArtStub
 * @param actionsMenuPosition
 * @param onActionsMenuOpen
 * @param onActionsMenuClosed
 * @constructor
 */
const AlbumArt: FC<AlbumArtProps> = ({
    album,
    artUri,
    alt,
    radius = 0,
    showControls = true,
    size = 150,
    showArtStub = false,
    actionsMenuPosition,
    onActionsMenuOpen,
    onActionsMenuClosed,
}) => {
    const [addMediaToPlaylist] = useAddMediaToPlaylistMutation();
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();

    return (
        <Box className={classes.albumArtContainer}>
            {showArtStub ? (
                <div style={{ width: size, height: size }}></div>
            ) : (
                <Image
                    src={!showArtStub ? (artUri ? artUri : album ? album.album_art_uri : "") : ""}
                    alt={alt ? alt : album ? `${album.artist} / ${album.title}` : "unknown"}
                    fit="cover"
                    width={size}
                    height={size}
                    radius={radius}
                />
            )}

            {album && showControls && (
                <Flex
                    p="xs"
                    justify="space-between"
                    align="flex-end"
                    // className={`${dynamicClasses.albumControls} ${
                    className={`${classes.albumControls} ${
                        isActionsMenuOpen && classes.actionsMenuActive
                    }`}
                    sx={{ width: size, height: size }}
                >
                    <VibinIconButton
                        icon={IconPlayerPlay}
                        size={15}
                        container={true}
                        fill={true}
                        onClick={() => addMediaToPlaylist({ mediaId: album.id, action: "REPLACE" })}
                    />

                    <AlbumActionsButton
                        album={album}
                        position={actionsMenuPosition}
                        categories={["Playlist"]}
                        onOpen={() => {
                            setIsActionsMenuOpen(true);
                            onActionsMenuOpen && onActionsMenuOpen();
                        }}
                        onClose={() => {
                            // This timeout is to prevent an issue where the user clicks outside
                            // the actions menu to close the menu, but the click is then picked up
                            // by the onClick() handler on the album art, which then triggers the
                            // display of the tracks modal. The delay in setting isActionsMenuOpen
                            // will prevent this behavior.
                            //
                            // This only works as described when the user clicks on album art
                            // associated with the actions menu.
                            //
                            // TODO: This feels hacky. It would be nice to see if there was a way
                            //  to more cleanly ignore clicks which are outside a
                            //  currently-displayed actions menu.
                            //
                            // TODO: Consider doing something in the AlbumWall component to prevent
                            //  all other album interactions if an action menu is open. Or perhaps set
                            //  some application state when the actions are visible (which other
                            //  components can key off of to enable/disable behaviours).
                            setTimeout(() => {
                                setIsActionsMenuOpen(false);
                                onActionsMenuClosed && onActionsMenuClosed();
                            }, 250);
                        }}
                    />
                </Flex>
            )}
        </Box>
    );
};

export default AlbumArt;

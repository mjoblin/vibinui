import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Flex, Image } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlayerPlay } from "@tabler/icons";

import { Track } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
// import AlbumActionsButton, { AlbumActionCategory } from "./AlbumActionsButton";
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
        top: 0,
        left: 0,
        opacity: 0,
        transition: "transform .2s ease-in-out, opacity .2s ease-in-out",
        "&:hover": {
            opacity: 1,
        },
    },
}));

type TrackArtProps = {
    track?: Track;
    artUri?: string;
    alt?: string;
    radius?: number;
    showControls?: boolean;
    // actionCategories?: AlbumActionCategory[];
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
 * @param actionCategories
 * @param size
 * @param actionsMenuPosition
 * @param onActionsMenuOpen
 * @param onActionsMenuClosed
 * @constructor
 */
const TrackArt: FC<TrackArtProps> = ({
    track,
    artUri,
    alt,
    radius = 0,
    showControls = true,
    // actionCategories = ["Playlist"],
    size = 150,
    actionsMenuPosition,
    onActionsMenuOpen,
    onActionsMenuClosed,
}) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();

    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error replacing Playlist",
                message: `[${status}] ${data}`,
                autoClose: false,
            });
        }
    }, [addStatus]);

    return (
        <Box className={classes.albumArtContainer}>
            <Image
                src={artUri ? artUri : track ? track.album_art_uri : ""}
                alt={alt ? alt : track ? `${track.artist} / ${track.title}` : "unknown"}
                fit="cover"
                radius={radius}
                width={size}
                height={size}
            />

            {track && showControls && (
                <Flex
                    p="xs"
                    justify="space-between"
                    align="flex-end"
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
                        tooltipLabel="Play"
                        onClick={() => {
                            if (!track.id) {
                                return;
                            }

                            addMediaToPlaylist({ mediaId: track.id, action: "REPLACE" });

                            showNotification({
                                title: `Replaced Playlist with Track`,
                                message: track.title,
                            });
                        }}
                    />

                    {/*<AlbumActionsButton*/}
                    {/*    album={album}*/}
                    {/*    position={actionsMenuPosition}*/}
                    {/*    categories={actionCategories}*/}
                    {/*    onOpen={() => {*/}
                    {/*        setIsActionsMenuOpen(true);*/}
                    {/*        onActionsMenuOpen && onActionsMenuOpen();*/}
                    {/*    }}*/}
                    {/*    onClose={() => {*/}
                    {/*        // This timeout is to prevent an issue where the user clicks outside*/}
                    {/*        // the actions menu to close the menu, but the click is then picked up*/}
                    {/*        // by the onClick() handler on the album art, which then triggers the*/}
                    {/*        // display of the tracks modal. The delay in setting isActionsMenuOpen*/}
                    {/*        // will prevent this behavior.*/}
                    {/*        //*/}
                    {/*        // This only works as described when the user clicks on album art*/}
                    {/*        // associated with the actions menu.*/}
                    {/*        //*/}
                    {/*        // TODO: This feels hacky. It would be nice to see if there was a way*/}
                    {/*        //  to more cleanly ignore clicks which are outside a*/}
                    {/*        //  currently-displayed actions menu.*/}
                    {/*        //*/}
                    {/*        // TODO: Consider doing something in the AlbumWall component to prevent*/}
                    {/*        //  all other album interactions if an action menu is open. Or perhaps set*/}
                    {/*        //  some application state when the actions are visible (which other*/}
                    {/*        //  components can key off of to enable/disable behaviours).*/}
                    {/*        setTimeout(() => {*/}
                    {/*            setIsActionsMenuOpen(false);*/}
                    {/*            onActionsMenuClosed && onActionsMenuClosed();*/}
                    {/*        }, 250);*/}
                    {/*    }}*/}
                    {/*/>*/}
                </Flex>
            )}
        </Box>
    );
};

export default TrackArt;

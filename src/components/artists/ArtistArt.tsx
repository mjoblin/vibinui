import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Flex, Image } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { Artist } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import MediaActionsButton from "../shared/MediaActionsButton";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import VibinIconButton from "../shared/VibinIconButton";
import { showErrorNotification } from "../../app/utils";

// NOTE: TrackArt and AlbumArt are very similar.

const useStyles = createStyles((theme) => ({
    artistArtContainer: {
        position: "relative",
    },
    actionsMenuActive: {
        opacity: 1,
    },
    artistControls: {
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

type ArtistArtProps = {
    artist?: Artist;
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

// TODO: Image fit is "cover", which will effectively zoom in on non-square artist art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

/**
 *
 * Either `artist` or `artUri` should be passed.
 *
 * @param artist
 * @param artUri
 * @param alt
 * @param radius
 * @param showControls
 * @param size
 * @param actionsMenuPosition
 * @param onActionsMenuOpen
 * @param onActionsMenuClosed
 * @constructor
 */
const ArtistArt: FC<ArtistArtProps> = ({
    artist,
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

            showErrorNotification({
                title: "Error replacing Playlist",
                message: `[${status}] ${data}`,
            });
        }
    }, [addStatus]);

    return (
        <Box className={classes.artistArtContainer}>
            <Image
                src={artUri ? artUri : artist ? artist.album_art_uri : ""}
                alt={alt ? alt : artist ? `${artist.title} / ${artist.title}` : "unknown"}
                fit="cover"
                radius={radius}
                width={size}
                height={size}
            />

            {artist && showControls && (
                <Flex
                    p="xs"
                    justify="space-between"
                    align="flex-end"
                    className={`${classes.artistControls} ${
                        isActionsMenuOpen && classes.actionsMenuActive
                    }`}
                    sx={{ width: size, height: size }}
                >
                    {/*<VibinIconButton*/}
                    {/*    icon={IconPlayerPlay}*/}
                    {/*    size={15}*/}
                    {/*    container={true}*/}
                    {/*    fill={true}*/}
                    {/*    tooltipLabel="Play"*/}
                    {/*    onClick={() => {*/}
                    {/*        if (!track.id) {*/}
                    {/*            return;*/}
                    {/*        }*/}

                    {/*        addMediaToPlaylist({ mediaId: track.id, action: "REPLACE" });*/}

                    {/*        showNotification({*/}
                    {/*            title: `Replaced Playlist with Track`,*/}
                    {/*            message: track.title,*/}
                    {/*        });*/}
                    {/*    }}*/}
                    {/*/>*/}

                    {/*<MediaActionsButton*/}
                    {/*    mediaType="track"*/}
                    {/*    media={track}*/}
                    {/*    position={actionsMenuPosition}*/}
                    {/*    onOpen={() => {*/}
                    {/*        setIsActionsMenuOpen(true);*/}
                    {/*        onActionsMenuOpen && onActionsMenuOpen();*/}
                    {/*    }}*/}
                    {/*    onClose={() => {*/}
                    {/*        // This timeout is to prevent an issue where the user clicks outside*/}
                    {/*        // the actions menu to close the menu, but the click is then picked up*/}
                    {/*        // by the onClick() handler on the track art, which then triggers the*/}
                    {/*        // display of the tracks modal. The delay in setting isActionsMenuOpen*/}
                    {/*        // will prevent this behavior.*/}
                    {/*        //*/}
                    {/*        // This only works as described when the user clicks on track art*/}
                    {/*        // associated with the actions menu.*/}
                    {/*        //*/}
                    {/*        // TODO: This feels hacky. It would be nice to see if there was a way*/}
                    {/*        //  to more cleanly ignore clicks which are outside a*/}
                    {/*        //  currently-displayed actions menu.*/}
                    {/*        //*/}
                    {/*        // TODO: Consider doing something in the TrackWall component to prevent*/}
                    {/*        //  all other track interactions if an action menu is open. Or perhaps set*/}
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

export default ArtistArt;

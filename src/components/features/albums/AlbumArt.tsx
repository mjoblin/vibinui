import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Flex, Image } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import { IconPlayerPlay } from "@tabler/icons";

import { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import { Album } from "../../../app/types";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinActivePlaylist";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import MediaActionsButton, { EnabledActions } from "../../shared/buttons/MediaActionsButton";
import VibinIconButton from "../../shared/buttons/VibinIconButton";
import NoArtPlaceholder from "../../shared/mediaDisplay/NoArtPlaceholder";

// ================================================================================================
// Show the art for an Album.
//
// Contents:
//  - Art image
//  - Optional overlays:
//      - <MediaActionsButton>; actions can be enabled/disabled as via enabledActions prop.
//      - Play button.
//
// NOTE: AlbumArt and TrackArt are very similar.
// ================================================================================================

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

type AlbumArtProps = {
    album?: Album;
    artUri?: string;
    alt?: string;
    radius?: number;
    showControls?: boolean;
    enabledActions?: EnabledActions;
    size?: number;
    actionsMenuPosition?: FloatingPosition;
    onActionsMenuOpen?: () => void;
    onActionsMenuClosed?: () => void;
};

// NOTE: AlbumArt and TrackArt are very similar.

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const AlbumArt: FC<AlbumArtProps> = ({
    album,
    artUri,
    alt,
    radius = 0,
    showControls = true,
    enabledActions = {
        Details: ["all"],
        Favorites: ["all"],
        Navigation: ["ViewInArtists", "ViewInTracks"],
        Playlist: ["all"],
    },
    size = 150,
    actionsMenuPosition,
    onActionsMenuOpen,
    onActionsMenuClosed,
}) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();

    /**
     * Notify the user if there was an error playing the Album (playing an Album actually involves
     * replacing the Playlist with the Album).
     */
    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Error replacing Playlist",
                message: `[${status}] ${data}`,
            });
        }
    }, [addStatus]);

    const artUrl = artUri ? artUri : album ? album.album_art_uri : undefined;
    const isStreamerOff = streamerPower === "off";

    // --------------------------------------------------------------------------------------------

    return (
        <Box className={classes.albumArtContainer}>
            <Image
                src={artUrl}
                alt={alt ? alt : album ? `${album.artist} / ${album.title}` : undefined}
                fit="cover"
                radius={radius}
                width={size}
                height={size}
                withPlaceholder={true}
                placeholder={<NoArtPlaceholder artSize={size} />}
            />

            {album && showControls && (
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
                        disabled={isStreamerOff}
                        icon={IconPlayerPlay}
                        size={15}
                        container={true}
                        fill={true}
                        tooltipLabel="Play"
                        onClick={() => {
                            addMediaToPlaylist({ mediaId: album.id, action: "REPLACE" });

                            showSuccessNotification({
                                title: "Replaced Playlist with Album",
                                message: album.title,
                            });
                        }}
                    />

                    <MediaActionsButton
                        mediaType="album"
                        media={album}
                        position={actionsMenuPosition}
                        enabledActions={enabledActions}
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

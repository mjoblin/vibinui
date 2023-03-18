import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, Center, createStyles, Flex, Image, Text, useMantineTheme } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import { IconPlayerPlay } from "@tabler/icons";

import { Album } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import MediaActionsButton, { ActionCategory } from "../shared/MediaActionsButton";
import VibinIconButton from "../shared/VibinIconButton";
import { showErrorNotification, showSuccessNotification } from "../../app/utils";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

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
    actionCategories?: ActionCategory[];
    size?: number;
    showArtStub?: boolean;
    actionsMenuPosition?: FloatingPosition;
    onActionsMenuOpen?: () => void;
    onActionsMenuClosed?: () => void;
};

// NOTE: AlbumArt and TrackArt are very similar.

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
const AlbumArt: FC<AlbumArtProps> = ({
    album,
    artUri,
    alt,
    radius = 0,
    showControls = true,
    actionCategories = ["Playlist"],
    size = 150,
    actionsMenuPosition,
    onActionsMenuOpen,
    onActionsMenuClosed,
}) => {
    const { colors } = useMantineTheme();
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
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

    const artUrl = artUri ? artUri : album ? album.album_art_uri : undefined;
    const isStreamerOff = streamerPower === "off";

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
                placeholder={
                    <Box w="100%" h="100%" bg={colors.dark[6]}>
                        <Center w="100%" h="100%">
                            <Text transform="uppercase" weight="bold" size={11}>no art</Text>
                        </Center>
                    </Box>
                }
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
                        categories={actionCategories}
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

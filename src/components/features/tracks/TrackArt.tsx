import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Flex, Image } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { Track } from "../../../app/types";
import { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinPlaylist";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import MediaActionsButton, { EnabledActions } from "../../shared/buttons/MediaActionsButton";
import VibinIconButton from "../../shared/buttons/VibinIconButton";
import NoArtPlaceholder from "../../shared/mediaDisplay/NoArtPlaceholder";

// ================================================================================================
// Show the art for a Track.
//
// Contents:
//  - Art image
//  - Optional overlays:
//      - <MediaActionsButton>; actions can be enabled/disabled as via enabledActions prop.
//      - Play button.
//
// NOTE: TrackArt and AlbumArt are very similar.
// ================================================================================================

const useStyles = createStyles((theme) => ({
    trackArtContainer: {
        position: "relative",
    },
    actionsMenuActive: {
        opacity: 1,
    },
    trackControls: {
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
    enabledActions?: EnabledActions;
    hidePlayButton?: boolean;
    size?: number;
    actionsMenuPosition?: FloatingPosition;
    onActionsMenuOpen?: () => void;
    onActionsMenuClosed?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square track art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const TrackArt: FC<TrackArtProps> = ({
    track,
    artUri,
    alt,
    radius = 0,
    showControls = true,
    enabledActions = {
        Details: ["all"],
        Favorites: ["all"],
        Navigation: ["ViewInArtists", "ViewInAlbums"],
        Playlist: ["all"],
    },
    hidePlayButton = false,
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
     * Notify the user if there was an error playing the Track (playing a Track actually involves
     * replacing the Playlist with the Track).
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

    const isStreamerOff = streamerPower === "off";

    // --------------------------------------------------------------------------------------------

    return (
        <Box className={classes.trackArtContainer}>
            <Image
                src={artUri ? artUri : track ? track.album_art_uri : ""}
                fit="cover"
                radius={radius}
                width={size}
                height={size}
                withPlaceholder={true}
                placeholder={<NoArtPlaceholder artSize={size} />}
            />

            {/* Only show the track controls for locally-streamed media */}
            {track && showControls && (
                <Flex
                    p="xs"
                    justify="space-between"
                    align="flex-end"
                    className={`${classes.trackControls} ${
                        isActionsMenuOpen && classes.actionsMenuActive
                    }`}
                    sx={{ width: size, height: size }}
                >
                    {hidePlayButton ? (
                        <Box />
                    ) : (
                        <VibinIconButton
                            disabled={isStreamerOff}
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

                                showSuccessNotification({
                                    title: `Replaced Playlist with Track`,
                                    message: track.title,
                                });
                            }}
                        />
                    )}

                    <MediaActionsButton
                        mediaType="track"
                        media={track}
                        position={actionsMenuPosition}
                        enabledActions={enabledActions}
                        onOpen={() => {
                            setIsActionsMenuOpen(true);
                            onActionsMenuOpen && onActionsMenuOpen();
                        }}
                        onClose={() => {
                            // This timeout is to prevent an issue where the user clicks outside
                            // the actions menu to close the menu, but the click is then picked up
                            // by the onClick() handler on the track art, which then triggers the
                            // display of the tracks modal. The delay in setting isActionsMenuOpen
                            // will prevent this behavior.
                            //
                            // This only works as described when the user clicks on track art
                            // associated with the actions menu.
                            //
                            // TODO: This feels hacky. It would be nice to see if there was a way
                            //  to more cleanly ignore clicks which are outside a
                            //  currently-displayed actions menu.
                            //
                            // TODO: Consider doing something in the TrackWall component to prevent
                            //  all other track interactions if an action menu is open. Or perhaps set
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

export default TrackArt;

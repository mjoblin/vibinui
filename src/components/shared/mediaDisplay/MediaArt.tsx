import React, { FC, useState } from "react";
import { Box, createStyles, Flex, Image, Skeleton, Stack } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";

import { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import { isAlbum, isPreset, isTrack, Media } from "../../../app/types";
import { useFavorites } from "../../../app/hooks/useFavorites";
import MediaActionsButton, { EnabledActions } from "../../shared/buttons/MediaActionsButton";
import NoArtPlaceholder from "../../shared/mediaDisplay/NoArtPlaceholder";
import PlayButton from "../buttons/PlayButton";
import FavoriteIndicator from "../buttons/FavoriteIndicator";

// ================================================================================================
// Show the art for a Media item.
//
// Contents:
//  - Art image
//  - Optional overlays display on hover:
//      - Centered <PlayButton>; or
//      - Bottom overlay with <PlayButton> and <MediaActionsButton>; actions can be
//        enabled/disabled as via enabledActions prop.
//
// Notes:
//
// - The media prop is optional. If media is not specified then artUri needs to be passed, and it
//   will not be possible to display any media controls.
// - Display of controls (actions and play button) can be controlled independently (showActions and
//   showPlayButton) or as a group (showControls).
// - If centeredPlayButton is true, then the center play button will override the display of the
//   bottom play button and actions menu.
// - Image fit defaults to "cover", which will effectively zoom in on non-square album art. The fit
//   can be switched "contain" which will show the entire non-square art (and add top/bottom or
//   left/right bars as appropriate).
// ================================================================================================

const useStyles = createStyles((theme) => ({
    mediaArtContainer: {
        display: "grid",
        gridTemplateAreas: "mediaArt",
        justifyItems: "center",
        alignItems: "center",
    },
    // Container content (i.e. image art)
    mediaArtContent: {
        gridArea: "mediaArt",
        zIndex: 1, // TODO: Find way to avoid using zIndex while supporting overlapping interactive divs
    },
    // Overlay at bottom of container (media actions and non-centered play button)
    mediaArtControlsOverlay: {
        gridArea: "mediaArt",
        alignSelf: "stretch",
        justifySelf: "stretch",
        display: "grid",
        alignContent: "stretch",
        zIndex: 2,
    },
    // Centered overlay (centered play button). Have it consume the entire art display area, and
    // transition into being displayed on hover.
    mediaArtCenteredOverlay: {
        gridArea: "mediaArt",
        width: "100%",
        height: "100%",
        display: "grid",
        alignContent: "center",
        justifyContent: "center",
        zIndex: 3,
        opacity: 0,
        transition: "transform .2s ease-in-out, opacity .2s ease-in-out",
        "&:hover": {
            opacity: 1,
        },
    },
    revealOnHover: {
        opacity: 0,
        transition: "transform .2s ease-in-out, opacity .2s ease-in-out",
        "&:hover": {
            opacity: 1,
        },
    },
    actionsMenuActive: {
        opacity: 1,
    },
}));

type MediaArtProps = {
    media?: Media;
    artUri?: string;
    alt?: string;
    radius?: number;
    fit?: React.CSSProperties["objectFit"];
    showControls?: boolean;
    showActions?: boolean;
    showFavoriteIndicator?: boolean;
    showPlayButton?: boolean;
    centerPlayButton?: boolean;
    showLoading?: boolean;
    enabledActions?: EnabledActions;
    size?: number;
    playButtonSize?: number;
    actionsMenuPosition?: FloatingPosition;
    onPlay?: () => void;
    onActionsMenuOpen?: () => void;
    onActionsMenuClosed?: () => void;
};

/** Image URL for given media. */
function mediaArtUrl(media?: Media): string | undefined {
    if (!media) {
        return undefined;
    } else if (isAlbum(media)) {
        return media.album_art_uri;
    } else if (isTrack(media)) {
        return media.art_url ? media.art_url : media.album_art_uri;
    } else if (isPreset(media)) {
        return media.art_url;
    } else {
        return undefined;
    }
}

const MediaArt: FC<MediaArtProps> = ({
    media,
    artUri,
    alt,
    radius,
    fit = "cover",
    showControls,
    showActions = true,
    showFavoriteIndicator = true,
    showPlayButton = true,
    centerPlayButton = false,
    showLoading = true,
    enabledActions,
    size,
    playButtonSize,
    actionsMenuPosition,
    onPlay,
    onActionsMenuOpen,
    onActionsMenuClosed,
}) => {
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const { classes } = useStyles();
    const { isFavoritedMedia } = useFavorites();

    const resolvedArtUri = artUri ?? mediaArtUrl(media);
    const [isLoadingArt, setIsLoadingArt] = useState<boolean>(!!resolvedArtUri);

    const isStreamerOff = streamerPower === "off";

    if (typeof showControls !== "undefined") {
        // Allow for showControls to override any control-specific show state.
        showActions = showControls;
        showFavoriteIndicator = showControls;
        showPlayButton = showControls;
    }

    if (typeof radius === "undefined") {
        radius = size && size <= 100 ? 3 : 5;
    }

    if (typeof enabledActions === "undefined") {
        // Default actions to enable.
        enabledActions = {
            Details: ["all"],
            Favorites: ["all"],
            Navigation: media
                ? isAlbum(media) || isTrack(media)
                    ? ["ViewInArtists", "ViewInAlbums"]
                    : []
                : [],
            Playlist: ["all"],
        };
    }

    /**
     * Alt text for given media.
     */
    const imageAlt = (media: Media): string => {
        if (isAlbum(media) || isTrack(media)) {
            return `${media.artist} / ${media.title}`;
        } else if (isPreset(media)) {
            return media.name;
        }

        return "";
    };

    // --------------------------------------------------------------------------------------------

    return (
        <Box className={classes.mediaArtContainer} w={size} h={size}>
            {/* Art image */}
            <Box className={classes.mediaArtContent}>
                <Skeleton visible={showLoading && isLoadingArt}>
                    <Image
                        src={resolvedArtUri}
                        alt={alt ? alt : media ? imageAlt(media) : undefined}
                        fit={fit}
                        radius={radius}
                        width={size}
                        height={size}
                        withPlaceholder={true}
                        placeholder={<NoArtPlaceholder artSize={size} radius={radius} />}
                        onLoad={() => setIsLoadingArt(false)}
                    />
                </Skeleton>
            </Box>

            {/* Centered play button */}
            {media && showPlayButton && centerPlayButton && !isLoadingArt && (
                <Box className={classes.mediaArtCenteredOverlay}>
                    <PlayButton
                        media={media}
                        disabled={isStreamerOff}
                        size={playButtonSize ? playButtonSize : size ? size * 0.4 : size}
                        onPlay={onPlay}
                    />
                </Box>
            )}

            {/* Bottom controls (play button and media actions) */}
            {media &&
                ((showPlayButton && !centerPlayButton) || showActions || showFavoriteIndicator) &&
                !isLoadingArt && (
                    <Box
                        className={`${classes.mediaArtControlsOverlay} ${
                            isActionsMenuOpen && classes.actionsMenuActive
                        }`}
                    >
                        <Stack justify="space-between">
                            {showFavoriteIndicator && (
                                <Flex
                                    justify="flex-end"
                                    pt={3}
                                    pr={5}
                                    className={
                                        !isFavoritedMedia(media) ? classes.revealOnHover : undefined
                                    }
                                >
                                    <FavoriteIndicator media={media} size={25} highContrast />
                                </Flex>
                            )}

                            <Flex
                                p="xs"
                                justify="space-between"
                                align="flex-end"
                                className={classes.revealOnHover}
                                sx={{ flexGrow: 1 }}
                            >
                                {showPlayButton && !centerPlayButton ? (
                                    <PlayButton
                                        media={media}
                                        disabled={isStreamerOff}
                                        size={playButtonSize ? playButtonSize : 30}
                                        onPlay={onPlay}
                                    />
                                ) : (
                                    <Box />
                                )}

                                {showActions ? (
                                    <MediaActionsButton
                                        media={media}
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
                                ) : (
                                    <Box />
                                )}
                            </Flex>
                        </Stack>
                    </Box>
                )}
        </Box>
    );
};

export default MediaArt;

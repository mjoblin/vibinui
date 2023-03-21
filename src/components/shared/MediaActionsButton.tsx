import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import { Box, Center, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import {
    IconCornerDownRight,
    IconCornerDownRightDouble,
    IconDisc,
    IconDotsVertical,
    IconHeart,
    IconHeartOff,
    IconList,
    IconMicrophone2,
    IconPlayerPlay,
    IconPlaylistAdd,
    IconUser,
} from "@tabler/icons";

import { Album, Track } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import {
    useAddFavoriteMutation,
    useDeleteFavoriteMutation,
} from "../../app/services/vibinFavorites";
import AlbumTracksModal from "../tracks/AlbumTracksModal";
import { showErrorNotification, showSuccessNotification } from "../../app/utils";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    setAlbumsActiveCollection,
    setAlbumsFilterText,
    setArtistsActiveCollection,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
    setTracksFilterText
} from "../../app/store/userSettingsSlice";

export type MediaType = "album" | "track";

export type FavoritesAction = "all" | "AddFavorite" | "RemoveFavorite";
export type NavigationAction = "all" | "ViewInArtists" | "ViewInAlbums" | "ViewInTracks";
export type PlaylistAction =
    | "all"
    | "AppendToEnd"
    | "InsertAndPlayNext"
    | "InsertAndPlayNow"
    | "ReplaceAndPlayNow";
export type TrackAction = "all" | "ViewTracks";

export type MediaAction = FavoritesAction | NavigationAction | PlaylistAction | TrackAction;

export type EnabledActions = {
    Tracks?: TrackAction[],
    Playlist?: PlaylistAction[],
    Favorites?: FavoritesAction[],
    Navigation?: NavigationAction[],
}

const sizeMd = 15;
const sizeSm = 11;

const useStyles = createStyles((theme) => ({
    actionsContainer: {
        "&:hover": {
            cursor: "pointer",
        },
    },
    actionsInCircleContainer: {
        borderRadius: 15,
        backgroundColor: "rgb(255, 255, 255, 0.2)",
        transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
        "&:hover": {
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
    enabledActions?: EnabledActions;
    position?: FloatingPosition;
    size?: "md" | "sm";
    inCircle?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const MediaActionsButton: FC<MediaActionsButtonProps> = ({
    mediaType,
    media,
    enabledActions = {
        Favorites: ["all"],
        Navigation: ["all"],
        Playlist: ["all"],
        Tracks: ["all"],
    },
    position = "top",
    size = "md",
    inCircle = true,
    onOpen = undefined,
    onClose = undefined,
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [addFavorite, addFavoriteStatus] = useAddFavoriteMutation();
    const [deleteFavorite, deleteFavoriteStatus] = useDeleteFavoriteMutation();
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const albumById = useAppSelector((state: RootState) => state.mediaGroups.albumById);
    const artistByName = useAppSelector((state: RootState) => state.mediaGroups.artistByName);
    const [showTracksModal, setShowTracksModal] = useState<boolean>(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const theme = useMantineTheme();
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
    const isFavorited = !!favorites.find((favorite) => favorite.media_id === media.id);
    const isStreamerOff = streamerPower === "off";

    const showTrackActions = enabledActions.Tracks && enabledActions.Tracks.length > 0;
    const showFavoritesActions = enabledActions.Favorites && enabledActions.Favorites.length > 0;
    const showNavigationActions = enabledActions.Navigation && enabledActions.Navigation.length > 0;
    const showPlaylistActions = enabledActions.Playlist && enabledActions.Playlist.length > 0;

    const wantAction = (callerActions: MediaAction[], action: MediaAction): boolean =>
        callerActions.some((callerAction) => [action, "all"].includes(callerAction));

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
                            className={`${classes.actionsContainer} ${
                                inCircle && classes.actionsInCircleContainer
                            } ${isActionsMenuOpen && inCircle && classes.buttonActive}`}
                            w={inCircle ? (size === "md" ? sizeMd * 2 : sizeSm * 2) : undefined}
                            h={inCircle ? (size === "md" ? sizeMd * 2 : sizeSm * 2) : undefined}
                        >
                            <Box pt={size === "md" ? (inCircle ? 3 : 4) : 0}>
                                <IconDotsVertical size={size === "md" ? sizeMd : sizeSm} />
                            </Box>
                        </Center>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    {/* Tracks actions -------------------------------------------------------- */}

                    {showTrackActions &&
                        mediaType === "album" &&
                        wantAction(enabledActions.Tracks!!, "ViewTracks") && (
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

                    {/* Playlist actions ------------------------------------------------------ */}

                    {showPlaylistActions && (
                        <>
                            <Menu.Label>Playlist</Menu.Label>

                            {wantAction(enabledActions.Playlist!!, "ReplaceAndPlayNow") && (
                                <Menu.Item
                                    disabled={isStreamerOff}
                                    icon={
                                        <IconPlayerPlay
                                            size={14}
                                            color={
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.gray[5]
                                                    : theme.colors.dark[6]
                                            }
                                            fill={
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.gray[5]
                                                    : theme.colors.dark[6]
                                            }
                                        />
                                    }
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
                            )}

                            {wantAction(enabledActions.Playlist!!, "InsertAndPlayNow") && (
                                <Menu.Item
                                    disabled={isStreamerOff}
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
                            )}

                            {wantAction(enabledActions.Playlist!!, "InsertAndPlayNext") && (
                                <Menu.Item
                                    disabled={isStreamerOff}
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
                            )}

                            {wantAction(enabledActions.Playlist!!, "AppendToEnd") && (
                                <Menu.Item
                                    disabled={isStreamerOff}
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
                            )}
                        </>
                    )}

                    {/* Favorites actions ----------------------------------------------------- */}

                    {showFavoritesActions && (
                        <>
                            <Menu.Label>Favorites</Menu.Label>

                            {wantAction(enabledActions.Favorites!!, "AddFavorite") && (
                                <Menu.Item
                                    icon={<IconHeart size={14} />}
                                    disabled={isFavorited}
                                    onClick={() => {
                                        addFavorite({ type: mediaType, mediaId: media.id });

                                        showSuccessNotification({
                                            title: `${mediaTypeDisplay} added to Favorites`,
                                            message: media.title,
                                        });
                                    }}
                                >
                                    Add to Favorites
                                </Menu.Item>
                            )}

                            {wantAction(enabledActions.Favorites!!, "RemoveFavorite") && (
                                <Menu.Item
                                    icon={<IconHeartOff size={14} />}
                                    disabled={!isFavorited}
                                    onClick={() => {
                                        deleteFavorite({ mediaId: media.id });

                                        showSuccessNotification({
                                            title: `${mediaTypeDisplay} removed from Favorites`,
                                            message: media.title,
                                        });
                                    }}
                                >
                                    Remove from Favorites
                                </Menu.Item>
                            )}
                        </>
                    )}

                    {/* Navigation actions ---------------------------------------------------- */}

                    {showNavigationActions && (
                        <>
                            <Menu.Label>Navigation</Menu.Label>

                            {wantAction(enabledActions.Navigation!!, "ViewInArtists") && (
                                <Menu.Item
                                    icon={<IconUser size={14} />}
                                    onClick={() => {
                                        dispatch(setArtistsActiveCollection("all"));

                                        if (mediaType === "album") {
                                            dispatch(
                                                setArtistsSelectedArtist(artistByName[media.artist])
                                            );
                                            dispatch(setArtistsSelectedAlbum(albumById[media.id]));
                                            dispatch(setArtistsSelectedTrack(undefined));
                                        } else if (mediaType === "track") {
                                            dispatch(
                                                setArtistsSelectedArtist(artistByName[media.artist])
                                            );
                                            dispatch(
                                                setArtistsSelectedAlbum(
                                                    albumById[(media as Track).parentId]
                                                )
                                            );
                                            dispatch(setArtistsSelectedTrack(media as Track));
                                        }

                                        navigate("/ui/artists");
                                    }}
                                >
                                    View in Artists
                                </Menu.Item>
                            )}

                            {wantAction(enabledActions.Navigation!!, "ViewInAlbums") && (
                                <Menu.Item
                                    icon={<IconDisc size={14} />}
                                    onClick={() => {
                                        dispatch(setAlbumsActiveCollection("all"));
                                        dispatch(
                                            setAlbumsFilterText(
                                                mediaType === "album"
                                                    ? `${media.title} artist:(${media.artist})`
                                                    : `${(media as Track).album} artist:(${
                                                          media.artist
                                                      })`
                                            )
                                        );
                                        navigate("/ui/albums");
                                    }}
                                >
                                    View in Albums
                                </Menu.Item>
                            )}

                            {wantAction(enabledActions.Navigation!!, "ViewInTracks") && (
                                <Menu.Item
                                    icon={<IconMicrophone2 size={14} />}
                                    onClick={() => {
                                        dispatch(
                                            setTracksFilterText(
                                                mediaType === "album"
                                                    ? `artist:(${media.artist}) album:(${media.title})`
                                                    : `${media.title} album:(${
                                                          (media as Track).album
                                                      })`
                                            )
                                        );
                                        navigate("/ui/tracks");
                                    }}
                                >
                                    View in Tracks
                                </Menu.Item>
                            )}
                        </>
                    )}
                </Menu.Dropdown>

                {/* Album Tracks modal -------------------------------------------------------- */}

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

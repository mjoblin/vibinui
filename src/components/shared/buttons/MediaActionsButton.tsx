import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import { Box, Center, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import { FloatingPosition } from "@mantine/core/lib/Floating/types";
import {
    IconArticle,
    IconCornerDownRight,
    IconCornerDownRightDouble,
    IconDisc,
    IconDotsVertical,
    IconExternalLink,
    IconHeart,
    IconHeartOff,
    IconList,
    IconMicrophone2,
    IconPlayerPlay,
    IconPlaylistAdd,
    IconUser,
    IconWaveSine,
} from "@tabler/icons";

import { Album, Track } from "../../../app/types";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinPlaylist";
import {
    useAddFavoriteMutation,
    useDeleteFavoriteMutation,
} from "../../../app/services/vibinFavorites";
import AlbumTracksModal from "../../features/albums/AlbumTracksModal";
import TrackLinksModal from "../../features/tracks/TrackLinksModal";
import TrackLyricsModal from "../../features/tracks/TrackLyricsModal";
import TrackWaveformModal from "../../features/tracks/TrackWaveformModal";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/useInterval";
import { RootState } from "../../../app/store/store";
import {
    setAlbumsActiveCollection,
    setAlbumsFilterText,
    setArtistsActiveCollection,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
    setTracksFilterText
} from "../../../app/store/userSettingsSlice";
import {
    setArtistsScrollToCurrentOnScreenEnter,
    setArtistsScrollToSelectedOnScreenEnter,
} from "../../../app/store/internalSlice";

export type MediaType = "album" | "track";

export type DetailsAction = "all" | "ViewLinks" | "ViewLyrics" | "ViewTracks" | "ViewWaveform";
export type FavoritesAction = "all" | "AddFavorite" | "RemoveFavorite";
export type NavigationAction =
    | "all"
    | "ViewCurrentInArtists"
    | "ViewInArtists"
    | "ViewInAlbums"
    | "ViewInTracks";
export type PlaylistAction =
    | "all"
    | "AppendToEnd"
    | "InsertAndPlayNext"
    | "InsertAndPlayNow"
    | "ReplaceAndPlayNow";

export type MediaAction = DetailsAction | FavoritesAction | NavigationAction | PlaylistAction;

export type EnabledActions = {
    Details?: DetailsAction[],
    Favorites?: FavoritesAction[],
    Navigation?: NavigationAction[],
    Playlist?: PlaylistAction[],
}

const sizeMd = 15;
const sizeSm = 11;

// TODO: See if these dark/light enabled/disabled are exposed in the mantine theme somewhere
const darkDisabled = "#5C5F6B";
const darkEnabled = "#C1C2C5";
const lightDisabled = "#adb5bd";
const lightEnabled = "#000";

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
    size?: "md" | "sm" | number;
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
        Details: ["all"],
        Favorites: ["all"],
        Navigation: ["all"],
        Playlist: ["all"],
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
    const [addFavorite] = useAddFavoriteMutation();
    const [deleteFavorite] = useDeleteFavoriteMutation();
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const albumById = useAppSelector((state: RootState) => state.mediaGroups.albumById);
    const artistByName = useAppSelector((state: RootState) => state.mediaGroups.artistByName);
    const [showAlbumTracksModal, setShowAlbumTracksModal] = useState<boolean>(false);
    const [showTrackLinksModal, setShowTrackLinksModal] = useState<boolean>(false);
    const [showTrackLyricsModal, setShowTrackLyricsModal] = useState<boolean>(false);
    const [showTrackWaveformModal, setShowTrackWaveformModal] = useState<boolean>(false);
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

    const showDetailsActions = enabledActions.Details && enabledActions.Details.length > 0;
    const showFavoritesActions = enabledActions.Favorites && enabledActions.Favorites.length > 0;
    const showNavigationActions = enabledActions.Navigation && enabledActions.Navigation.length > 0;
    const showPlaylistActions = enabledActions.Playlist && enabledActions.Playlist.length > 0;

    const displaySize = size === "sm" ? sizeSm : size === "md" ? sizeMd : size;

    const wantAction = (callerActions: MediaAction[], action: MediaAction): boolean =>
        callerActions.some((callerAction) => [action, "all"].includes(callerAction));

    const wantViewInArtists = wantAction(enabledActions.Navigation!!, "ViewInArtists");
    const wantViewCurrentInArtists = wantAction(
        enabledActions.Navigation!!,
        "ViewCurrentInArtists"
    );
    
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
                            w={inCircle ? displaySize * 2 : undefined}
                            h={inCircle ? displaySize * 2 : undefined}
                        >
                            <Box pt={displaySize === sizeMd ? (inCircle ? 3 : 4) : 0}>
                                <IconDotsVertical size={displaySize} />
                            </Box>
                        </Center>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    {/* Details actions ------------------------------------------------------- */}

                    {showDetailsActions && (
                        <>
                            <Menu.Label>Details</Menu.Label>

                            {mediaType === "album" &&
                                wantAction(enabledActions.Details!!, "ViewTracks") && (
                                    <Menu.Item
                                        icon={<IconList size={14} />}
                                        onClick={() => setShowAlbumTracksModal(true)}
                                    >
                                        View tracks...
                                    </Menu.Item>
                                )}

                            {mediaType === "track" &&
                                wantAction(enabledActions.Details!!, "ViewLyrics") && (
                                    <Menu.Item
                                        icon={<IconArticle size={14} />}
                                        onClick={() => setShowTrackLyricsModal(true)}
                                    >
                                        View lyrics...
                                    </Menu.Item>
                                )}

                            {mediaType === "track" &&
                                wantAction(enabledActions.Details!!, "ViewWaveform") && (
                                    <Menu.Item
                                        icon={<IconWaveSine size={14} />}
                                        onClick={() => setShowTrackWaveformModal(true)}
                                    >
                                        View waveform...
                                    </Menu.Item>
                                )}

                            {mediaType === "track" &&
                                wantAction(enabledActions.Details!!, "ViewLinks") && (
                                    <Menu.Item
                                        icon={<IconExternalLink size={14} />}
                                        onClick={() => setShowTrackLinksModal(true)}
                                    >
                                        View links...
                                    </Menu.Item>
                                )}
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
                                            fill={
                                                theme.colorScheme === "dark"
                                                    ? isStreamerOff
                                                        ? darkDisabled
                                                        : darkEnabled
                                                    : isStreamerOff
                                                        ? lightDisabled
                                                        : lightEnabled
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

                            {(wantViewInArtists || wantViewCurrentInArtists) && (
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

                                        wantViewInArtists &&
                                            dispatch(setArtistsScrollToSelectedOnScreenEnter(true));
                                        wantViewCurrentInArtists &&
                                            dispatch(setArtistsScrollToCurrentOnScreenEnter(true));

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

                {/* Details modals ------------------------------------------------------------ */}

                {/* Albums can show their track list */}
                {mediaType === "album" && (
                    <AlbumTracksModal
                        album={media as Album}
                        opened={showAlbumTracksModal}
                        onClose={() => setShowAlbumTracksModal(false)}
                    />
                )}

                {/* Tracks can show their lyrics, waveform, and links */}
                {mediaType === "track" && (
                    <TrackLyricsModal
                        track={media as Track}
                        opened={showTrackLyricsModal}
                        onClose={() => setShowTrackLyricsModal(false)}
                    />
                )}

                {mediaType === "track" && (
                    <TrackWaveformModal
                        track={media as Track}
                        opened={showTrackWaveformModal}
                        onClose={() => setShowTrackWaveformModal(false)}
                    />
                )}

                {mediaType === "track" && (
                    <TrackLinksModal
                        track={media as Track}
                        opened={showTrackLinksModal}
                        onClose={() => setShowTrackLinksModal(false)}
                    />
                )}
            </Menu>
        </Box>
    );
};

export default MediaActionsButton;

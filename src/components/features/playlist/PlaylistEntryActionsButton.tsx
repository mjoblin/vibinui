import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import { Box, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import {
    IconArrowBarToDown,
    IconArrowBarToUp,
    IconArticle,
    IconCornerDownRightDouble,
    IconDisc,
    IconDotsVertical,
    IconExternalLink,
    IconHeart,
    IconHeartOff,
    IconMicrophone2,
    IconPhoto,
    IconPlayerPlay,
    IconTrash,
    IconWaveSine,
} from "@tabler/icons-react";

import { PlaylistEntry } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useDeleteQueueItemIdMutation,
    useMoveQueueItemIdMutation,
    usePlayQueueItemIdMutation,
} from "../../../app/services/vibinQueue";
import {
    useAddFavoriteMutation,
    useDeleteFavoriteMutation,
} from "../../../app/services/vibinFavorites";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import {
    setAlbumsActiveCollection,
    setAlbumsFilterText,
    setArtistsActiveCollection,
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
} from "../../../app/store/userSettingsSlice";
import {
    setArtistsScrollToCurrentOnScreenEnter,
    setArtistsScrollToSelectedOnScreenEnter,
} from "../../../app/store/internalSlice";
import { setTracksFilterText } from "../../../app/store/userSettingsSlice";
import TrackLyricsModal from "../../shared/mediaDisplay/TrackLyricsModal";
import TrackWaveformModal from "../../shared/mediaDisplay/TrackWaveformModal";
import TrackLinksModal from "../../shared/mediaDisplay/TrackLinksModal";
import ArtModal from "../../shared/mediaDisplay/ArtModal";

// ================================================================================================
// Button which reveals an overlay menu of actions that can be performed on the Playlist entry.
//
// NOTE: This component is very similar to <MediaActionsButton>. Currently, the two components are
//  separate as they differ enough to make generalizing them a little unwieldy -- but that may not
//  always be the case.
// ================================================================================================

// TODO: See if these dark/light enabled/disabled are exposed in the mantine theme somewhere
const darkDisabled = "#5C5F6B";
const darkEnabled = "#C1C2C5";
const lightDisabled = "#adb5bd";
const lightEnabled = "#000";

const useStyles = createStyles((theme) => ({
    button: {
        transition: "color .2s ease-in-out",
        "&:hover": {
            color: theme.colors.gray[1],
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
}));

type PlaylistEntryActionsButtonProps = {
    entry: PlaylistEntry;
    entryCount: number;
    currentlyPlayingIndex: number | undefined;
    onOpen?: () => void;
    onClose?: () => void;
};

// TODO: Image fit is "cover", which will effectively zoom in on non-square album art. Could add
//  a prop to switch this to "contain" which will show the entire non-square art (and add
//  top/bottom or left/right bars as appropriate).

const PlaylistEntryActionsButton: FC<PlaylistEntryActionsButtonProps> = ({
    entry,
    entryCount,
    currentlyPlayingIndex = undefined,
    onOpen = undefined,
    onClose = undefined,
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const [moveQueueItem, moveQueueItemStatus] = useMoveQueueItemIdMutation();
    const [deleteQueueItem, deleteStatus] = useDeleteQueueItemIdMutation();
    const [addFavorite] = useAddFavoriteMutation();
    const [deleteFavorite] = useDeleteFavoriteMutation();
    const [playQueueItem, playStatus] = usePlayQueueItemIdMutation();
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { albumById, artistByName, trackById } = useAppSelector(
        (state: RootState) => state.mediaGroups,
    );
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
    const [showTrackLinksModal, setShowTrackLinksModal] = useState<boolean>(false);
    const [showTrackLyricsModal, setShowTrackLyricsModal] = useState<boolean>(false);
    const [showTrackWaveformModal, setShowTrackWaveformModal] = useState<boolean>(false);
    const [showArtModal, setShowArtModal] = useState<boolean>(false);
    const { classes } = useStyles();
    const menuStyles = useMenuStyles();

    /**
     * For notifications, we assume that any playlist changes are successful. If we do get some
     * sort of error though then a second notification is created. This is done instead of
     * attempting to track the success/fail state of each playlist update separately and modifying
     * the update's notification to reflect success/fail.
     */
    useEffect(() => {
        if (moveQueueItemStatus.isError || deleteStatus.isError || playStatus.isError) {
            const { status, data } = moveQueueItemStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title:
                    moveQueueItemStatus.isError || deleteStatus.isError
                        ? "Error updating Queue"
                        : "Error playing Entry",
                message: `[${status}] ${data}`,
            });
        }
    }, [moveQueueItemStatus, deleteStatus, playStatus]);

    const isStreamerOff = streamerPower === "off";
    const isFavorited = !!favorites.find((favorite) => favorite.media_id === entry.trackMediaId);

    // --------------------------------------------------------------------------------------------

    return (
        <Box>
            <Menu
                classNames={menuStyles.classes}
                position="top"
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
                // TODO: Setting zIndex to ensure it renders over the Nav bar; find better approach
                zIndex={999}
            >
                <Menu.Target>
                    <Tooltip label="Entry actions" disabled={isActionsMenuOpen}>
                        <Box pt={4} className={classes.button}>
                            <IconDotsVertical size={15} />
                        </Box>
                    </Tooltip>
                </Menu.Target>

                <Menu.Dropdown>
                    <>
                        {/* Queue actions ----------------------------------------------------- */}

                        <Menu.Label>Queue</Menu.Label>

                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconArrowBarToUp size={14} />}
                            onClick={() => {
                                moveQueueItem({
                                    itemId: entry.id,
                                    fromPosition: entry.index,
                                    toPosition: 0,
                                });

                                showSuccessNotification({
                                    title: "Entry moved to top of Queue",
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to top
                        </Menu.Item>

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
                                playQueueItem({ itemId: entry.id });
                            }}
                        >
                            Play now
                        </Menu.Item>

                        <Menu.Item
                            disabled={isStreamerOff || !currentlyPlayingIndex}
                            icon={<IconCornerDownRightDouble size={14} />}
                            onClick={() => {
                                if (!currentlyPlayingIndex) {
                                    return;
                                }

                                const newPosition = currentlyPlayingIndex + 1;

                                moveQueueItem({
                                    itemId: entry.id,
                                    fromPosition: entry.index,
                                    toPosition: newPosition,
                                });

                                showSuccessNotification({
                                    title: `Entry moved to play next (#${newPosition + 1})`,
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to Play next
                        </Menu.Item>

                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconArrowBarToDown size={12} />}
                            onClick={() => {
                                moveQueueItem({
                                    itemId: entry.id,
                                    fromPosition: entry.index,
                                    toPosition: entryCount - 1,
                                });

                                showSuccessNotification({
                                    title: "Entry moved to bottom of Queue",
                                    message: entry.title,
                                });
                            }}
                        >
                            Move to bottom
                        </Menu.Item>

                        <Menu.Item
                            disabled={isStreamerOff}
                            icon={<IconTrash size={14} />}
                            onClick={() => {
                                deleteQueueItem({ itemId: entry.id });

                                showSuccessNotification({
                                    title: "Entry removed from Queue",
                                    message: entry.title,
                                });
                            }}
                        >
                            Remove from Queue
                        </Menu.Item>

                        {/* Details actions --------------------------------------------------- */}

                        <Menu.Label>Details</Menu.Label>

                        <Menu.Item
                            icon={<IconArticle size={14} />}
                            onClick={() => setShowTrackLyricsModal(true)}
                        >
                            View lyrics...
                        </Menu.Item>

                        <Menu.Item
                            icon={<IconWaveSine size={14} />}
                            onClick={() => setShowTrackWaveformModal(true)}
                        >
                            View waveform...
                        </Menu.Item>

                        <Menu.Item
                            icon={<IconExternalLink size={14} />}
                            onClick={() => setShowTrackLinksModal(true)}
                        >
                            View links...
                        </Menu.Item>

                        <Menu.Item
                            icon={<IconPhoto size={14} />}
                            onClick={() => setShowArtModal(true)}
                        >
                            View art...
                        </Menu.Item>

                        {/* Favorites actions ------------------------------------------------- */}

                        <Menu.Label>Favorites</Menu.Label>

                        <Menu.Item
                            icon={<IconHeart size={14} />}
                            disabled={isFavorited}
                            onClick={() => {
                                addFavorite({ type: "track", mediaId: entry.trackMediaId });

                                showSuccessNotification({
                                    title: "Track added to Favorites",
                                    message: entry.title,
                                });
                            }}
                        >
                            Add to Favorites
                        </Menu.Item>

                        <Menu.Item
                            icon={<IconHeartOff size={14} />}
                            disabled={!isFavorited}
                            onClick={() => {
                                deleteFavorite({ mediaId: entry.trackMediaId });

                                showSuccessNotification({
                                    title: "Track removed from Favorites",
                                    message: entry.title,
                                });
                            }}
                        >
                            Remove from Favorites
                        </Menu.Item>

                        {/* Navigation actions ------------------------------------------------ */}

                        <Menu.Label>Navigation</Menu.Label>

                        <Menu.Item
                            icon={<IconDisc size={14} />}
                            onClick={() => {
                                dispatch(setArtistsActiveCollection("all"));
                                dispatch(setArtistsSelectedArtist(artistByName[entry.artist]));
                                dispatch(setArtistsSelectedAlbum(albumById[entry.albumMediaId]));
                                dispatch(setArtistsSelectedTrack(trackById[entry.trackMediaId]));

                                if (entry.index === currentlyPlayingIndex) {
                                    dispatch(setArtistsScrollToCurrentOnScreenEnter(true));
                                } else {
                                    dispatch(setArtistsScrollToSelectedOnScreenEnter(true));
                                }

                                navigate("/ui/artists");
                            }}
                        >
                            View in Artists
                        </Menu.Item>

                        <Menu.Item
                            icon={<IconDisc size={14} />}
                            onClick={() => {
                                dispatch(setAlbumsActiveCollection("all"));
                                dispatch(
                                    setAlbumsFilterText(`${entry.album} artist:(${entry.artist})`),
                                );
                                navigate("/ui/albums");
                            }}
                        >
                            View in Albums
                        </Menu.Item>

                        <Menu.Item
                            icon={<IconMicrophone2 size={14} />}
                            onClick={() => {
                                dispatch(
                                    setTracksFilterText(`${entry.title} album:(${entry.album})`),
                                );
                                navigate("/ui/tracks");
                            }}
                        >
                            View in Tracks
                        </Menu.Item>
                    </>
                </Menu.Dropdown>

                {/* Details modals ------------------------------------------------------------ */}

                {/* Tracks can show their lyrics, waveform, and links */}
                {trackById[entry.trackMediaId] && (
                    <>
                        <TrackLyricsModal
                            track={trackById[entry.trackMediaId]}
                            opened={showTrackLyricsModal}
                            onClose={() => setShowTrackLyricsModal(false)}
                        />

                        <TrackWaveformModal
                            track={trackById[entry.trackMediaId]}
                            opened={showTrackWaveformModal}
                            onClose={() => setShowTrackWaveformModal(false)}
                        />

                        <TrackLinksModal
                            track={trackById[entry.trackMediaId]}
                            opened={showTrackLinksModal}
                            onClose={() => setShowTrackLinksModal(false)}
                        />

                        <ArtModal
                            media={trackById[entry.trackMediaId]}
                            opened={showArtModal}
                            onClose={() => setShowArtModal(false)}
                        />
                    </>
                )}
            </Menu>
        </Box>
    );
};

export default PlaylistEntryActionsButton;

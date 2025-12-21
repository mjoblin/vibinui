import React, { FC, useEffect, useRef, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
    Box,
    Center,
    createStyles,
    Flex,
    Loader,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { IconGripVertical, IconPlayerPause, IconPlayerPlay, IconTrash } from "@tabler/icons-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { QueueItem } from "../../../app/types";
import {
    getTextWidth,
    secstoHms,
    showErrorNotification,
    showSuccessNotification,
    yearFromDate,
} from "../../../app/utils";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { useAppStatus } from "../../../app/hooks/useAppStatus";
import { useAppSelector } from "../../../app/hooks/store";
import { useMediaGroupings } from "../../../app/hooks/useMediaGroupings";
import { useGetAlbumsQuery } from "../../../app/services/vibinAlbums";
import { usePauseMutation, usePlayMutation } from "../../../app/services/vibinTransport";
import {
    useDeleteQueueItemIdMutation,
    useMoveQueueItemIdMutation,
    usePlayQueueItemIdMutation,
    usePlayQueueItemPositionMutation,
} from "../../../app/services/vibinQueue";
import FavoriteIndicator from "../../shared/buttons/FavoriteIndicator";
import MediaArt from "../../shared/mediaDisplay/MediaArt";
import VibinIconButton from "../../shared/buttons/VibinIconButton";
import PlaylistEntryActionsButton from "./PlaylistEntryActionsButton";
import SadLabel from "../../shared/textDisplay/SadLabel";
import SystemPower from "../../shared/buttons/SystemPower";

// ================================================================================================
// Shows the active streamer Playlist.
//
// Each Playlist Entry is shown as a row in a table. Each entry summarizes its associated media,
// and provides a <PlaylistEntryActionsButton> to perform actions on the Media. Entries can be
// reordered. Each Entry can be played by clicking it.
// ================================================================================================

const DIMMED = "#808080";
const TITLE_AND_ALBUM_COLUMN_GAP = 40;

/**
 * Takes a duration string in "hh:mm:ss.ms" format and strips any redundant leading 0's and :'s.
 * Also strips any trailing ".0*" (i.e. milliseconds). e.g. "00:04:17.000" will be returned as
 * "4:17".
 */
const durationDisplay = (duration: string): string =>
    duration.replace(/^0+:0?/, "").replace(/\.0+$/, "");

/**
 * Returns a shallow copy of inArray, where the element at fromIndex has been moved to toIndex.
 */
const moveArrayElement = (inArray: any[], fromIndex: number, toIndex: number): any[] => {
    const outArray = [...inArray];

    const movedEntry = outArray[fromIndex];
    outArray.splice(fromIndex, 1);
    outArray.splice(toIndex, 0, movedEntry);

    return outArray;
};

const useStyles = createStyles((theme) => ({
    table: {
        borderCollapse: "collapse",
        thead: {
            fontWeight: "bold",
            borderBottom: "1px solid rgb(0, 0, 0, 0)",
        },
        "tbody > tr:not(:first-of-type)": {
            borderTop: `1px solid ${theme.colors.gray[8]}`,
        },
        "tbody > tr:not(:last-of-type)": {
            borderBottom: `1px solid ${theme.colors.gray[8]}`,
        },
        td: {
            fontSize: 14,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 4,
            paddingBottom: 4,
        },
        "td:first-of-type": {
            fontSize: 12,
            paddingLeft: 25,
            paddingRight: 15,
        },
        "td:nth-of-type(3),td:nth-of-type(4)": {
            paddingRight: 25,
        },
        "td:last-of-type": {
            paddingRight: 25,
        },
    },
    tableSimple: {
        td: {
            paddingTop: 3,
            paddingBottom: 3,
        },
    },
    highlight: {
        backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.yellow[2],
    },
    highlightOnHover: {
        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.yellow[2],
        },
    },
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
    alignRight: {
        textAlign: "right",
    },
    dimmed: {
        color: DIMMED,
    },
    dragHandle: {
        ...theme.fn.focusStyles(),
        width: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
    },
}));

type PlaylistProps = {
    onNewCurrentEntryRef?: (ref: HTMLDivElement) => void;
    onPlaylistModified?: () => void;
};

/**
 * Play Now (Inserts Track or Album after current Track in Playlist, and plays)
 * Play from Here (Tracks only; same as "Replace Queue" + "Now play this track")
 * Play Next (Inserts Track or Album after current Track in Playlist, and plays)
 * Add to Queue (Adds Track or Album after last Track in Playlist)
 * Replace Queue (Replaces Queue with Track or Album)
 *
 * @constructor
 */

const Playlist: FC<PlaylistProps> = ({ onNewCurrentEntryRef, onPlaylistModified }) => {
    const { colors } = useMantineTheme();
    const { CURRENTLY_PLAYING_COLOR, SCREEN_LOADING_PT } = useAppGlobals();
    const { haveActivatedPlaylist, isLocalMediaActive } = useAppStatus();
    const { trackById } = useMediaGroupings();
    const queue = useAppSelector((state: RootState) => state.queue);
    const { autoPlayOnPlaylistActivation } = useAppSelector(
        (state: RootState) => state.userSettings.application,
    );
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const {
        status: { is_activating_playlist: isActivatingPlaylist },
    } = useAppSelector((state: RootState) => state.storedPlaylists);
    const { data: albums } = useGetAlbumsQuery();
    const [deleteQueueItem, deleteStatus] = useDeleteQueueItemIdMutation();
    const [moveQueueItem] = useMoveQueueItemIdMutation();
    const [playQueueItem] = usePlayQueueItemIdMutation();
    const [playQueuePosition] = usePlayQueueItemPositionMutation();
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [actionsMenuOpenFor, setActionsMenuOpenFor] = useState<number | undefined>(undefined);
    const [optimisticQueueItems, setOptimisticQueueItems] = useState<QueueItem[]>([]);
    const currentEntryRef = useRef<HTMLDivElement>(null);
    const { classes } = useStyles();

    const currentTrackIndex = queue.play_position;

    const currentEntryBorderColor = isLocalMediaActive ? CURRENTLY_PLAYING_COLOR : colors.gray[7];

    // Define some CSS to ensure that the currently-playing playlist entry has an active/highlighted
    // border around it.
    //
    // Note:
    //  * A table row border is made up of the left/right/bottom borders of the row itself, and the
    //    bottom border of the row above it. This is due to 'borderCollapse: "collapse"' on the
    //    table itself.
    //  * This means the first table body's row has its top border defined by the bottom border of
    //    the table head.
    //  * Table rows start at 1, whereas the playlist index starts at 0.
    //  * When a row isn't being highlighted, it still renders a transparent border of the same
    //    thickness. This is to prevent rows slightly moving up/down when the highlighted border is
    //    enabled (see the table's CSS defined earlier).

    const { classes: dynamicClasses } = createStyles((theme) => {
        if (currentTrackIndex === null || currentTrackIndex === undefined) {
            return {
                table: {},
            };
        }

        const previousRowCSS = {
            borderBottom: `1px solid ${currentEntryBorderColor} !important`,
        };

        const currentlyPlayingRowCSS = {
            color: theme.white,
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.yellow[6],
            border: `1px solid ${currentEntryBorderColor} !important`,
        };

        if (currentTrackIndex === 0) {
            return {
                table: {
                    "thead > tr": previousRowCSS,
                    "tbody > tr:nth-of-type(1)": currentlyPlayingRowCSS,
                },
            };
        } else {
            return {
                table: {
                    [`tbody > tr:nth-of-type(${currentTrackIndex})`]:
                        previousRowCSS,
                    [`tbody > tr:nth-of-type(${currentTrackIndex + 1})`]:
                        currentlyPlayingRowCSS,
                },
            };
        }
    })();

    // --------------------------------------------------------------------------------------------

    /**
     * Inform the user if there was an error while attempting to remove a Playlist Entry.
     */
    useEffect(() => {
        if (deleteStatus.isError) {
            const { status, data } = deleteStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Error removing Entry from Queue",
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
    }, [deleteStatus]);

    /**
     * When a playlist has finished activating, start playing the first entry.
     */
    useEffect(() => {
        if (autoPlayOnPlaylistActivation && !isActivatingPlaylist && haveActivatedPlaylist) {
            playQueuePosition({ itemPosition: 0 });
        }
    }, [
        autoPlayOnPlaylistActivation,
        haveActivatedPlaylist,
        isActivatingPlaylist,
        playQueuePosition,
    ]);

    /**
     * Handle Queue reordering and optimistic UI updates.
     *
     * Notes on optimistic updates:
     *
     * This component uses the queue from Redux state *and* a local copy of that state (in
     * optimisticQueueItems) to support optimistic UI updates when queue items are
     * reordered. When reordering, this component will reorder optimisticQueueItems for
     * immediate rendering updates, as well as request the reordering in the backend (using
     * useMoveQueueItemIdMutation()). The backend will then announce the new queue order,
     * which will update the Redux queue state, which will in turn reset
     * optimisticQueueItems to now reflect the backend's queue order.
     *
     * Note also that Mantine has a useListState() hook which provides convenient ways to interface
     * with lists, including a reorder() method. That approach is not being used here, but might
     * be useful in the future. See: https://mantine.dev/hooks/use-list-state/
     */

    useEffect(() => {
        setOptimisticQueueItems(queue?.items || []);
    }, [queue?.items]);

    /**
     * Inform the parent component when the current Queue item changes.
     */
    useEffect(() => {
        if (onNewCurrentEntryRef && currentEntryRef && currentEntryRef.current) {
            onNewCurrentEntryRef(currentEntryRef.current);
        }
    }, [currentEntryRef, onNewCurrentEntryRef, currentTrackIndex]);

    // --------------------------------------------------------------------------------------------

    // Disallow playlist display while the streamer is off. This may not be strictly necessary, but
    // it provides a more intuitive (to me) user experience (my mental model: if streamer is off,
    // it can't be interacted with).
    if (streamerPower !== "on") {
        return (
            <Box pt={35}>
                <SystemPower label="streamer is in standby mode" />
            </Box>
        );
    }

    if (!queue.haveReceivedInitialState || isActivatingPlaylist) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    const queueItems: QueueItem[] =
        optimisticQueueItems.length > 0
            ? optimisticQueueItems
            : queue?.items && queue.items.length > 0
              ? queue.items
              : [];

    if (queueItems.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Queue to display" />
            </Center>
        );
    }

    // TODO: Fix this text width determination to properly account for cases where the sub-text
    //  (artist name and year/genre) might be wider than the main text above it (song title and
    //  album name).

    const maxTitleWidth = Math.max(...queueItems.map((item) => getTextWidth(item.metadata?.title || "")));
    const maxAlbumWidth = Math.max(...queueItems.map((item) => getTextWidth(item.metadata?.album || "")));

    /**
     * Find the album year for the first album matching the given title & artist. This is a little
     * flaky as it's taking a queue item title/artist and assuming it will match an album in the
     * albums list. Also, the queue item artist could be a track artist which can be different from
     * an album artist.
     *
     * TODO: See if this "queue item to full album entry" lookup can be made more reliable.
     */
    const albumYear = (title: string, artist: string): number | undefined => {
        if (!albums) {
            return undefined;
        }

        const album = albums.find(
            (album) => album.title === title && (album.artist === artist || !album.artist),
        );

        return album ? yearFromDate(album.date) : undefined;
    };

    // ============================================================================================

    /**
     * Generate an array of table rows; one row per queue item.
     */
    const renderedQueueItems = queueItems
        .map((item, index) => {
            const metadata = item.metadata;
            const title = metadata?.title || "";
            const artist = metadata?.artist || "";
            const album = metadata?.album || "";
            const artUrl = metadata?.art_url || "";
            const duration = metadata?.duration;
            const year = albumYear(album, artist);
            // TODO: Figure out where "(Unknown Genre)" is coming from; this hardcoding is awkward
            const genre =
                metadata?.genre === "(Unknown Genre)" ? undefined : metadata?.genre?.toLocaleUpperCase();

            // TODO: The date and genre processing here is similar to <AlbumTracks>. Consider extracting.
            const albumSubtitle =
                year && genre
                    ? `${year} • ${genre}`
                    : !year && !genre
                      ? ""
                      : year && !genre
                        ? year
                        : genre;

            return (
                <Draggable key={`${item.id}`} index={index} draggableId={`${item.id}`}>
                    {(provided) => (
                        <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            key={item.id.toString()}
                            className={`${
                                index !== currentTrackIndex && actionsMenuOpenFor
                                    ? actionsMenuOpenFor === item.id
                                        ? classes.highlight
                                        : ""
                                    : classes.highlightOnHover
                            }`}
                        >
                            <td
                                className={`${classes.alignRight} ${classes.dimmed}`}
                                style={{ width: 35 }}
                            >
                                {/* Attach a reference to the currently-playing item so the
                                    "scroll to current" feature has something to work with. */}
                                <Box
                                    ref={
                                        index === currentTrackIndex
                                            ? currentEntryRef
                                            : undefined
                                    }
                                >
                                    <Text size={12} color={colors.dark[3]}>
                                        {item.position + 1}
                                    </Text>
                                </Box>
                            </td>
                            {viewMode === "detailed" && (
                                <td style={{ width: 50 }}>
                                    <MediaArt artUri={artUrl} size={35} />
                                </td>
                            )}
                            <td
                                className={classes.pointerOnHover}
                                style={{ width: maxTitleWidth + TITLE_AND_ALBUM_COLUMN_GAP }}
                                onClick={() => {
                                    // Heuristic when user clicks a queue item:
                                    //  - If it's the current track:
                                    //      - If currently playing, pause the track
                                    //      - If currently paused, resume playback
                                    //      - If source is not local media, play track from beginning
                                    //  - If it's not the current track, play track from beginning
                                    index === currentTrackIndex &&
                                    isLocalMediaActive &&
                                    playStatus === "pause"
                                        ? resumePlayback()
                                        : index === currentTrackIndex &&
                                            isLocalMediaActive &&
                                            playStatus === "play" &&
                                            streamerPower === "on"
                                          ? pausePlayback()
                                          : playQueueItem({ itemId: item.id });
                                }}
                            >
                                <Stack spacing={0}>
                                    <Text>{title}</Text>
                                    {viewMode === "detailed" && (
                                        <Text
                                            size={12}
                                            color={colors.dark[3]}
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {artist}
                                        </Text>
                                    )}
                                </Stack>
                            </td>
                            <td
                                className={
                                    index !== currentTrackIndex
                                        ? classes.pointerOnHover
                                        : ""
                                }
                                style={{ width: maxAlbumWidth + TITLE_AND_ALBUM_COLUMN_GAP }}
                                onClick={() => {
                                    index !== currentTrackIndex &&
                                        playQueueItem({ itemId: item.id });
                                }}
                            >
                                <Stack spacing={0}>
                                    <Text>{album}</Text>
                                    {viewMode === "detailed" && (
                                        <Text
                                            size={12}
                                            color={colors.dark[3]}
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {albumSubtitle}
                                        </Text>
                                    )}
                                </Stack>
                            </td>
                            <td className={classes.alignRight} style={{ width: 85 }}>
                                {duration !== null && duration !== undefined ? secstoHms(duration) : ""}
                            </td>
                            <td style={{ width: 45 }}>
                                <Flex pl={5} gap={5} align="center">
                                    {/* Item Play button. If the item is the current item,
                                        then instead implement Pause/Resume behavior. */}
                                    {index ===
                                    (isLocalMediaActive && currentTrackIndex) ? (
                                        playStatus === "play" && streamerPower === "on" ? (
                                            <VibinIconButton
                                                icon={IconPlayerPause}
                                                container={false}
                                                fill={true}
                                                tooltipLabel="Pause"
                                                onClick={() => pausePlayback()}
                                            />
                                        ) : (
                                            <VibinIconButton
                                                icon={IconPlayerPlay}
                                                container={false}
                                                fill={true}
                                                tooltipLabel="Resume"
                                                onClick={() => resumePlayback()}
                                            />
                                        )
                                    ) : (
                                        <VibinIconButton
                                            icon={IconPlayerPlay}
                                            container={false}
                                            fill={true}
                                            tooltipLabel="Play"
                                            onClick={() => playQueueItem({ itemId: item.id })}
                                        />
                                    )}

                                    <VibinIconButton
                                        icon={IconTrash}
                                        container={false}
                                        tooltipLabel="Remove from Queue"
                                        onClick={() => {
                                            deleteQueueItem({ itemId: item.id });
                                            onPlaylistModified && onPlaylistModified();

                                            showSuccessNotification({
                                                title: "Entry removed from Queue",
                                                message: title,
                                            });
                                        }}
                                    />

                                    <Box miw="1.8rem">
                                        {item.trackMediaId && trackById[item.trackMediaId] && (
                                            <FavoriteIndicator
                                                media={trackById[item.trackMediaId]}
                                            />
                                        )}
                                    </Box>

                                    <PlaylistEntryActionsButton
                                        entry={item}
                                        entryCount={renderedQueueItems.length}
                                        currentlyPlayingIndex={currentTrackIndex}
                                        onOpen={() => setActionsMenuOpenFor(item.id)}
                                        onClose={() => setActionsMenuOpenFor(undefined)}
                                    />
                                </Flex>
                            </td>
                            <td style={{ width: 15 }}>
                                <div className={classes.dragHandle} {...provided.dragHandleProps}>
                                    <IconGripVertical size={18} stroke={1.5} />
                                </div>
                            </td>
                        </tr>
                    )}
                </Draggable>
            );
        });

    // --------------------------------------------------------------------------------------------

    return (
        <>
            <DragDropContext
                onDragStart={() => onPlaylistModified && onPlaylistModified()}
                onDragEnd={({ draggableId, source, destination }) => {
                    if (destination) {
                        if (source.index === destination.index) {
                            return;
                        }

                        // Reorder the component's local copy of the queue items used for
                        // rendering. This is done as a form of optimistic update, to ensure the UI
                        // is immediately showing the new queue ordering.
                        setOptimisticQueueItems(
                            moveArrayElement(
                                optimisticQueueItems,
                                source.index,
                                destination.index,
                            ),
                        );

                        // Request the queue item move in the backend. The new backend queue
                        // ordering will then be announced back to the UI, at which point the UI
                        // will mirror the backend state again (which presumably will also match
                        // the local optimistic view of the queue).
                        moveQueueItem({
                            itemId: parseInt(draggableId, 10),
                            fromPosition: source.index,
                            toPosition: destination.index,
                        });
                    }
                }}
            >
                <table
                    className={`${classes.table} ${dynamicClasses.table} ${
                        viewMode === "simple" ? classes.tableSimple : ""
                    }`}
                >
                    <thead>
                        <tr>
                            <td></td>
                            {viewMode === "detailed" && <td></td>}
                            <td>Title</td>
                            <td>Album</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </thead>

                    <Droppable droppableId="dnd-list" direction="vertical">
                        {(provided) => (
                            <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                {renderedQueueItems}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </table>
            </DragDropContext>
        </>
    );
};

export default Playlist;

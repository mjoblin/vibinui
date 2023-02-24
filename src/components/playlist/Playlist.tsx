import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
    Center,
    createStyles,
    Flex,
    Overlay,
    ScrollArea,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconGripVertical, IconPlayerPlay, IconTrash } from "@tabler/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { PlaylistEntry } from "../../app/types";
import { getTextWidth } from "../../app/utils";
import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery } from "../../app/services/vibinAlbums";
import {
    useDeletePlaylistEntryIdMutation,
    useMovePlaylistEntryIdMutation,
    usePlayPlaylistEntryIdMutation,
} from "../../app/services/vibinPlaylist";
import AlbumArt from "../albums/AlbumArt";
import VibinIconButton from "../shared/VibinIconButton";
import PlaylistEntryActionsButton from "./PlaylistEntryActionsButton";
import SadLabel from "../shared/SadLabel";
import StandbyMode from "../shared/StandbyMode";

// TODO: Make these part of the theme.
const DIMMED = "#808080";
const HIGHLIGHT_COLOR = "#252525";
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
            paddingTop: 8,
            paddingBottom: 8,
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
    currentlyPlaying: {
        color: theme.white,
        backgroundColor: theme.colors.dark[5],
    },
    highlight: {
        backgroundColor: HIGHLIGHT_COLOR,
    },
    highlightOnHover: {
        "&:hover": {
            backgroundColor: HIGHLIGHT_COLOR,
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

/**
 * Play Now (Inserts Track or Album after current Track in Playlist, and plays)
 * Play from Here (Tracks only; same as "Replace Queue" + "Now play this track")
 * Play Next (Inserts Track or Album after current Track in Playlist, and plays)
 * Add to Queue (Adds Track or Album after last Track in Playlist)
 * Replace Queue (Replaces Queue with Track or Album)
 *
 * @constructor
 */

const Playlist: FC = () => {
    const { colors } = useMantineTheme();
    const playlist = useAppSelector((state: RootState) => state.playlist);
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const {
        activating_stored_playlist: activatingStoredPlaylist,
    } = useAppSelector((state: RootState) => state.storedPlaylists);
    const { data: albums } = useGetAlbumsQuery();
    const [deletePlaylistId, deleteStatus] = useDeletePlaylistEntryIdMutation();
    const [movePlaylistId] = useMovePlaylistEntryIdMutation();
    const [playPlaylistId] = usePlayPlaylistEntryIdMutation();
    const [actionsMenuOpenFor, setActionsMenuOpenFor] = useState<number | undefined>(undefined);
    const [optimisticPlaylistEntries, setOptimisticPlaylistEntries] = useState<PlaylistEntry[]>([]);

    const { classes } = useStyles();

    useEffect(() => {
        if (deleteStatus.isError) {
            const { status, data } = deleteStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error removing Entry from Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
                color: "red",
                autoClose: false,
            });
        }
    }, [deleteStatus]);

    // Notes on playlist re-ordering and optimistic UI updates:
    //
    // This component uses the playlist from Redux state *and* a local copy of that state (in
    // optimisticPlaylistEntries) to support optimistic UI updates when playlist entries are
    // reordered. When reordering, this component will reorder optimisticPlaylistEntries for
    // immediate rendering updates, as well as request the reordering in the backend (using
    // useMovePlaylistEntryIdMutation()). The backend will then announce the new playlist order,
    // which will update the Redux playlist state, which will in turn reset
    // optimisticPlaylistEntries to now reflect the backend's playlist order.
    //
    // Note also that Mantine has a useListState() hook which provides convenient ways to interface
    // with lists, including a reorder() method. That approach is not being used here, but might
    // be useful in the future. See: https://mantine.dev/hooks/use-list-state/

    useEffect(() => {
        setOptimisticPlaylistEntries(playlist?.entries || []);
    }, [playlist?.entries]);

    if (playStatus === "not_ready") {
        return <StandbyMode />;
    }
    
    const playlistEntries: PlaylistEntry[] =
        optimisticPlaylistEntries.length > 0
            ? optimisticPlaylistEntries
            : playlist?.entries && playlist.entries.length > 0
            ? playlist.entries
            : [];

    // TODO: Render something useful when there's no playlist.
    if (playlistEntries.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Playlist to display" />
            </Center>
        );
    }

    // TODO: Fix this text width determination to properly account for cases where the sub-text
    //  (artist name and year/genre) might be wider than the main text above it (song title and
    //  album name).

    const maxTitleWidth = Math.max(
        ...playlistEntries.map((elem) => getTextWidth(elem.title))
    );
    const maxAlbumWidth = Math.max(
        ...playlistEntries.map((elem) => getTextWidth(elem.album))
    );

    // TODO: The date and genre processing here is similar to <AlbumTracks>. Consider extracting.

    /**
     * Find the album year for the first album matching the given title & artist. This is a little
     * flaky as it's taking a playlist title/artist and assuming it will match an album in the
     * albums list. Also, the playlist artist could be a track artist which can be different from
     * an album artist.
     *
     * TODO: See if this "playlist entry to full album entry" lookup can be made more reliable.
     */
    const albumYear = (title: string, artist: string): string | undefined => {
        if (!albums) {
            return undefined;
        }

        return albums
            .find((album) => album.title === title && (album.artist === artist || !album.artist))
            ?.date.split("-")[0];
    };

    /**
     * Generate an array of table rows; one row per playlist entry.
     *
     * TODO: Consider per-row interactivity and feedback. Currently, clicking the title or artist
     *  (but no other columns, aside from the play button) will play the entry.
     */
    const renderedPlaylistEntries = playlistEntries
        // .sort((a, b) => a.index - b.index)
        .map((entry, index) => {
            const year = albumYear(entry.album, entry.artist);
            // TODO: Figure out where "(Unknown Genre)" is coming from; this hardcoding is awkward
            const genre = entry.genre === "(Unknown Genre)" ? undefined : entry.genre;

            const albumSubtitle =
                year && genre
                    ? `${year} • ${genre}`
                    : !year && !genre
                    ? ""
                    : year && !genre
                    ? year
                    : genre;

            return (
                <Draggable key={`${entry.id}`} index={index} draggableId={`${entry.id}`}>
                    {(provided) => (
                        <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            key={entry.id.toString()}
                            className={
                                index === playlist.current_track_index
                                    ? classes.currentlyPlaying
                                    : actionsMenuOpenFor
                                    ? actionsMenuOpenFor === entry.id
                                        ? classes.highlight
                                        : ""
                                    : classes.highlightOnHover
                            }
                        >
                            <td
                                className={`${classes.alignRight} ${classes.dimmed}`}
                                style={{ width: 35 }}
                            >
                                <Text size={12} color={colors.dark[3]}>
                                    {entry.index + 1}
                                </Text>
                            </td>
                            {viewMode === "detailed" && (
                                <td style={{ width: 50 }}>
                                    <AlbumArt artUri={entry.albumArtURI} size={35} radius={3} />
                                </td>
                            )}
                            <td
                                className={
                                    index !== playlist.current_track_index
                                        ? classes.pointerOnHover
                                        : ""
                                }
                                style={{ width: maxTitleWidth + TITLE_AND_ALBUM_COLUMN_GAP }}
                                onClick={() => {
                                    index !== playlist.current_track_index &&
                                        playPlaylistId({ playlistId: entry.id });
                                }}
                            >
                                <Stack spacing={0}>
                                    <Text>{entry.title}</Text>
                                    {viewMode === "detailed" && (
                                        <Text
                                            size={12}
                                            color={colors.dark[3]}
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {entry.artist}
                                        </Text>
                                    )}
                                </Stack>
                            </td>
                            <td
                                className={
                                    index !== playlist.current_track_index
                                        ? classes.pointerOnHover
                                        : ""
                                }
                                style={{ width: maxAlbumWidth + TITLE_AND_ALBUM_COLUMN_GAP }}
                                onClick={() => {
                                    index !== playlist.current_track_index &&
                                        playPlaylistId({ playlistId: entry.id });
                                }}
                            >
                                <Stack spacing={0}>
                                    <Text>{entry.album}</Text>
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
                                {durationDisplay(entry.duration)}
                            </td>
                            <td style={{ width: 45 }}>
                                <Flex pl={5} gap={5} align="center">
                                    <VibinIconButton
                                        icon={IconPlayerPlay}
                                        container={false}
                                        fill={true}
                                        tooltipLabel="Play"
                                        onClick={() => playPlaylistId({ playlistId: entry.id })}
                                    />

                                    <VibinIconButton
                                        icon={IconTrash}
                                        container={false}
                                        tooltipLabel="Remove from Playlist"
                                        onClick={() => {
                                            deletePlaylistId({ playlistId: entry.id });

                                            showNotification({
                                                title: `Entry removed from Playlist`,
                                                message: entry.title,
                                            });
                                        }}
                                    />

                                    <PlaylistEntryActionsButton
                                        entry={entry}
                                        entryCount={renderedPlaylistEntries.length}
                                        currentlyPlayingIndex={playlist.current_track_index}
                                        onOpen={() => setActionsMenuOpenFor(entry.id)}
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
        <ScrollArea>
            {activatingStoredPlaylist && <Overlay opacity={0.5} color="#000000" radius={5} />}
            <DragDropContext
                onDragEnd={({ draggableId, source, destination }) => {
                    if (destination) {
                        if (source.index === destination.index) {
                            return;
                        }

                        // Reorder the component's local copy of the playlist entries used for
                        // rendering. This is done as a form of optimistic update, to ensure the UI
                        // is immediately showing the new playlist ordering.
                        setOptimisticPlaylistEntries(
                            moveArrayElement(
                                optimisticPlaylistEntries,
                                source.index,
                                destination.index
                            )
                        );

                        // Request the playlist item move in the backend. The new backend playlist
                        // ordering will then be announced back to the UI, at which point the UI
                        // will mirror the backend state again (which presumably will also match
                        // the local optimistic view of the playlist).
                        movePlaylistId({
                            playlistId: parseInt(draggableId, 10),
                            fromIndex: source.index,
                            toIndex: destination.index,
                        });
                    }
                }}
            >
                <table
                    className={`${classes.table} ${
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
                                {renderedPlaylistEntries}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </table>
            </DragDropContext>
        </ScrollArea>
    );
};

export default Playlist;

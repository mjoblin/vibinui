import React, { FC } from "react";
import { Box, createStyles, Flex, ScrollArea, Stack, Table } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { IconGripVertical, IconPlayerPlay, IconTrash } from "@tabler/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    useDeletePlaylistEntryIdMutation,
    useMovePlaylistEntryIdMutation,
    usePlayPlaylistEntryIdMutation,
} from "../../app/services/vibinPlaylist";
import { useGetAlbumsQuery } from "../../app/services/vibinBase";
import AlbumArt from "../albums/AlbumArt";
import VibinIconButton from "../shared/VibinIconButton";

// TODO: Make these part of the theme.
const DIMMED = "#808080";
const HIGHLIGHT_COLOR = "#252525";
const TITLE_AND_ALBUM_COLUMN_GAP = 40;

/**
 *
 * @param duration
 */
const durationDisplay = (duration: string): string =>
    duration.replace(/^0+:0?/, "").replace(/\.0+$/, "");

/**
 *
 * @param text
 */
const getTextWidth = (text: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
        context.font = getComputedStyle(document.body).font;
        return context.measureText(text).width;
    }

    return 0;
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
    currentlyPlaying: {
        color: theme.white,
        backgroundColor: theme.colors.dark[5],
    },
    highlightOnHover: {
        "&:hover": {
            cursor: "pointer",
            backgroundColor: HIGHLIGHT_COLOR,
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
    const playlist = useAppSelector((state: RootState) => state.playlist);
    const { data: albums } = useGetAlbumsQuery();
    const [deletePlaylistId] = useDeletePlaylistEntryIdMutation();
    const [movePlaylistId] = useMovePlaylistEntryIdMutation();
    const [playPlaylistId] = usePlayPlaylistEntryIdMutation();
    const [optimisticPlaylistEntries, optimisticPlaylistEntriesHandlers] = useListState(
        playlist.entries
    );

    // Note on playlist re-ordering and optimistic UI updates:
    //
    // This component uses the playlist from Redux state *and* a local copy of that state (in
    // optimisticPlaylistEntries) to support optimistic UI updates when playlist entries are
    // reordered. When reordering, this component will reorder optimisticPlaylistEntries for
    // immediate rendering updates, as well as request the reordering in the backend (using
    // useMovePlaylistEntryIdMutation()). The backend will then announce the new playlist order,
    // which will update the Redux playlist state, which will in turn reset
    // optimisticPlaylistEntries (via useListState()) to now reflect the backend's playlist order.

    const { classes } = useStyles();

    if (!optimisticPlaylistEntries) {
        return <></>;
    }

    // TODO: Fix this text width determination to properly account for cases where the sub-text
    //  (artist name and year/genre) might be wider than the main text above it (song title and
    //  album name).

    const maxTitleWidth = Math.max(
        ...optimisticPlaylistEntries.map((elem) => getTextWidth(elem.title))
    );
    const maxAlbumWidth = Math.max(
        ...optimisticPlaylistEntries.map((elem) => getTextWidth(elem.album))
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
     */
    const playlistEntries = optimisticPlaylistEntries
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
                                    : classes.highlightOnHover
                            }
                            onClick={() => {
                                index !== playlist.current_track_index &&
                                    playPlaylistId({ playlistId: entry.id });
                            }}
                        >
                            <td
                                className={`${classes.alignRight} ${classes.dimmed}`}
                                style={{ width: 35 }}
                            >
                                {entry.index + 1}
                            </td>
                            <td style={{ width: 50 }}>
                                <AlbumArt artUri={entry.albumArtURI} size={35} radius={3} />
                            </td>
                            <td style={{ width: maxTitleWidth + TITLE_AND_ALBUM_COLUMN_GAP }}>
                                <Stack spacing={0}>
                                    <Box>{entry.title}</Box>
                                    <Box sx={{ color: "#686868", fontSize: 12 }}>
                                        {entry.artist}
                                    </Box>
                                </Stack>
                            </td>
                            <td style={{ width: maxAlbumWidth + TITLE_AND_ALBUM_COLUMN_GAP }}>
                                <Stack spacing={0}>
                                    <Box>{entry.album}</Box>
                                    <Box sx={{ color: "#686868", fontSize: 12 }}>
                                        {albumSubtitle}
                                    </Box>
                                </Stack>
                            </td>
                            <td className={classes.alignRight} style={{ width: 85 }}>
                                {durationDisplay(entry.duration)}
                            </td>
                            <td style={{ width: 45 }}>
                                <Flex pl={5} gap={5}>
                                    <VibinIconButton
                                        icon={IconPlayerPlay}
                                        container={false}
                                        fill={true}
                                        onClick={() => playPlaylistId({ playlistId: entry.id })}
                                    />

                                    <VibinIconButton
                                        icon={IconTrash}
                                        container={false}
                                        onClick={() => deletePlaylistId({ playlistId: entry.id })}
                                    />
                                </Flex>
                            </td>
                            <td  style={{ width: 15 }}>
                                <div className={classes.dragHandle} {...provided.dragHandleProps}>
                                    <IconGripVertical size={18} stroke={1.5} />
                                </div>
                            </td>
                        </tr>
                    )}
                </Draggable>
            );
        });

    return (
        <ScrollArea>
            <DragDropContext
                onDragEnd={({ draggableId, source, destination }) => {
                    if (destination) {
                        if (source.index === destination.index) {
                            return;
                        }

                        // Reorder the component's local copy of the playlist entries used for
                        // rendering. This is done as a form of optimistic update, to ensure the UI
                        // is immediately showing the new playlist ordering.
                        optimisticPlaylistEntriesHandlers.reorder({
                            from: source.index,
                            to: destination.index || 0,
                        });

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
                <table className={classes.table}>
                    <thead>
                        <tr>
                            <td></td>
                            <td></td>
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
                                {playlistEntries}
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

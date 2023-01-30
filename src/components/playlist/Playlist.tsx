import React, { FC } from "react";
import { Box, createStyles, Flex, Stack } from "@mantine/core";
import { IconPlayerPlay, IconTrash } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    usePlayPlaylistEntryIdMutation,
    useDeletePlaylistEntryIdMutation,
} from "../../app/services/vibinPlaylist";
import { useGetAlbumsQuery } from "../../app/services/vibinBase";
import AlbumArt from "../albums/AlbumArt";
import VibinIconButton from "../shared/VibinIconButton";

// TODO: Add error handling for playlist delete/move.

// TODO: Make these part of the theme.
const DIMMED = "#808080";
const HIGHLIGHT_COLOR = "#252525";

const durationDisplay = (duration: string): string =>
    duration.replace(/^0+:0?/, "").replace(/\.0+$/, "");

const useStyles = createStyles((theme) => ({
    table: {
        borderCollapse: "collapse",
        thead: {
            fontWeight: "bold",
        },
        td: {
            fontSize: 14,
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 3,
            paddingBottom: 3,
        },
        "td:first-of-type": {
            fontSize: 12,
            paddingLeft: 15,
            borderRadius: "5px 0 0 5px",
        },
        "td:nth-of-type(3),td:nth-of-type(4)": {
            paddingRight: 25,
        },
        "td:last-of-type": {
            paddingRight: 15,
            borderRadius: "0 5px 5px 0",
        },
    },
    currentlyPlaying: {
        color: theme.white,
        backgroundColor: theme.colors.blue,
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
    const [playPlaylistId] = usePlayPlaylistEntryIdMutation();
    const [deletePlaylistId] = useDeletePlaylistEntryIdMutation();
    const { data: albums } = useGetAlbumsQuery();

    const { classes } = useStyles();

    if (!playlist.entries) {
        return <></>;
    }

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
    const playlistEntries = playlist.entries.map((entry, index) => {
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
            <tr
                key={entry.id}
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
                <td className={`${classes.alignRight} ${classes.dimmed}`}>{entry.index + 1}</td>
                <td>
                    <AlbumArt artUri={entry.albumArtURI} size={20} radius={3} />
                </td>
                <td>
                    <Stack spacing={0}>
                        <Box>{entry.title}</Box>
                        <Box sx={{ color: "#686868", fontSize: 12, lineHeight: 1 }}>
                            {entry.artist}
                        </Box>
                    </Stack>
                </td>
                <td>
                    <Stack spacing={0}>
                        <Box>{entry.album}</Box>
                        <Box sx={{ color: "#686868", fontSize: 12, lineHeight: 1 }}>
                            {albumSubtitle}
                        </Box>
                    </Stack>
                </td>
                <td className={classes.alignRight}>{durationDisplay(entry.duration)}</td>
                <td>
                    <Flex pl={5} gap={10}>
                        <VibinIconButton
                            icon={IconPlayerPlay}
                            container={false}
                            fill={true}
                            onClick={() => playPlaylistId({ playlistId: entry.id })}
                        />

                        <VibinIconButton
                            icon={IconTrash}
                            container={false}
                            onClick={() => {
                                deletePlaylistId({ playlistId: entry.id });
                            }}
                        />
                    </Flex>
                </td>
            </tr>
        );
    });

    return (
        <table className={classes.table}>
            <thead>
                <tr>
                    <td></td>
                    <td></td>
                    <td>Title</td>
                    <td>Album</td>
                    <td></td>
                    <td></td>
                </tr>
            </thead>
            <tbody>{playlistEntries}</tbody>
        </table>
    );
};

export default Playlist;

import React, { FC } from "react";
import { createStyles, Flex } from "@mantine/core";
import { IconPlayerPlay, IconTrash } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    usePlayPlaylistEntryIdMutation,
    useDeletePlaylistEntryIdMutation,
} from "../../app/services/vibinPlaylist";
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
    const { classes } = useStyles();

    if (!playlist.entries) {
        return <></>;
    }

    const playlistEntries = playlist.entries.map((entry, index) => (
        <tr
            key={entry.id}
            className={
                index === playlist.current_track_index
                    ? classes.currentlyPlaying
                    : classes.highlightOnHover
            }
            onClick={() => {
                index !== playlist.current_track_index && playPlaylistId({ playlistId: entry.id });
            }}
        >
            <td className={`${classes.alignRight} ${classes.dimmed}`}>{entry.index + 1}</td>
            <td>
                <AlbumArt artUri={entry.albumArtURI} size={20} radius={3} />
            </td>
            <td>{entry.title}</td>
            <td>{entry.artist}</td>
            <td>{entry.album}</td>
            {/* TODO: Figure out where "(Unknown Genre)" is coming from; this hardcoding is awkward */}
            <td>{entry.genre === "(Unknown Genre)" ? "" : entry.genre}</td>
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
    ));

    return (
        <table className={classes.table}>
            <thead>
                <tr>
                    <td></td>
                    <td></td>
                    <td>Title</td>
                    <td>Artist</td>
                    <td>Album</td>
                    <td>Genre</td>
                    <td></td>
                    <td></td>
                </tr>
            </thead>
            <tbody>{playlistEntries}</tbody>
        </table>
    );
};

export default Playlist;

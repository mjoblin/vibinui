import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { usePlayPlaylistEntryIdMutation } from "../../app/services/vibinPlaylist";
import AlbumArt from "../albums/AlbumArt";
import PlayButton from "../albums/PlayButton";

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
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 2,
            paddingBottom: 2,
        },
        "td:first-of-type": {
            paddingLeft: 15,
        },
        "td:last-of-type": {
            paddingRight: 15,
        },
    },
    currentlyPlaying: {
        backgroundColor: theme.colors.blue,
    },
    highlightOnHover: {
        "&:hover": {
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
    const [playPlaylistIndex] = usePlayPlaylistEntryIdMutation();
    const { classes } = useStyles();

    if (!playlist.entries) {
        return <></>;
    }

    const playlistEntries = playlist.entries.map((entry, index) => (
        <tr
            key={entry.id}
            className={`${classes.highlightOnHover} ${
                index === playlist.current_track_index ? classes.currentlyPlaying : ""
            }`}
        >
            <td className={`${classes.alignRight} ${classes.dimmed}`}>{entry.index + 1}</td>
            <td>
                <AlbumArt artUri={entry.albumArtURI} size={30} radius={3} />
            </td>
            <td>{entry.title}</td>
            <td className={classes.dimmed}>{entry.album}</td>
            {/* TODO: Figure out where "(Unknown Genre)" is coming from; this hardcoding is awkward */}
            <td className={classes.dimmed}>
                {entry.genre === "(Unknown Genre)" ? "" : entry.genre}
            </td>
            <td className={classes.alignRight}>{durationDisplay(entry.duration)}</td>
            <td>
                {/* TODO: This top padding (to make the button position look right) feels hacky */}
                <Box pt={3}>
                    <PlayButton
                        container={false}
                        onClick={() => playPlaylistIndex({ playlistId: entry.id })}
                    />
                </Box>
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

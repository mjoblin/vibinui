import React, { FC } from "react";

import { PlaylistEntry } from "../../app/types";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

/**
 * Play Now (Inserts Track or Album after current Track in Playlist, and plays)
 * Play from Here (Tracks only; same as "Replace Queue" + "Now play this track")
 * Play Next (Inserts Track or Album after current Track in Playlist, and plays)
 * Add to Queue (Adds Track or Album after last Track in Playlist)
 * Replace Queue (Replaces Queue with Track or Album)
 *
 * @constructor
 */

const Playlist:FC = () => {
    const playlist = useAppSelector((state: RootState) => state.playlist);

    return (
        <div className="Playlist">
            <table>
                <tbody>
                    {playlist.entries &&
                        playlist.entries.map((entry: PlaylistEntry, idx) => (
                            <tr
                                key={entry.id}
                                style={{
                                    fontWeight:
                                        idx === playlist.current_track_index ? "bold" : "normal",
                                }}
                            >
                                <td>{entry.title}</td>
                                <td>{entry.duration}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export default Playlist;

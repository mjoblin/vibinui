import React from "react";

import usePlaylist from "../hooks/usePlaylist";

import "./Playlist.css";

function Playlist(props) {
    const { playlist, currentIndex } = props;
    const playlistControls = usePlaylist();

    return (
        <div className="Playlist">
            <table>
                <tbody>
                {
                    playlist.map(playlistEntry => (
                        <tr key={playlistEntry.id}>
                            <td
                                className={currentIndex === playlistEntry.index ? "current-track" : undefined}
                            >
                                {playlistEntry.title}
                            </td>
                            <td>
                                <button onClick={async () => await playlistControls.playId(playlistEntry.id)}>
                                    play
                                </button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>
    );
}

export default Playlist;

import React from "react";
import ReactJson from "react-json-view";
import get from "lodash/get";

import Albums from "./components/Albums";
import CurrentTrack from "./components/CurrentTrack";
import Playlist from "./components/Playlist";
import TransportControls from "./components/TransportControls";

import "./App.css";

let HOSTNAME = "192.168.1.30";

function App() {
    const [stateVars, setStateVars] = React.useState({});
    const [currentPlaylist, setCurrentPlaylist] = React.useState([]);
    const [isPaused, setPause] = React.useState(false);
    const ws = React.useRef(null);

    React.useEffect(() => {
        ws.current = new WebSocket(`ws://${HOSTNAME}:7669/ws`);
        ws.current.onopen = () => console.log("ws opened");
        ws.current.onclose = () => console.log("ws closed");

        return () => {
            ws.current.close();
        };
    }, []);

    React.useEffect(() => {
        if (!ws.current) return;

        ws.current.onmessage = e => {
            if (isPaused) return;
            const message = JSON.parse(e.data);
            setStateVars(message);
        };
    }, [isPaused]);

    // TODO: Add current_track to top-level vibin state
    const playlistEntry = get(
        stateVars,
        "streamer.UuVolControl.PlaybackJSON.reciva.playback-details.playlist-entry"
    );

    const playlistFromStateVars = get(stateVars, "vibin.streamer.current_playlist");

    if (
        playlistFromStateVars &&
        (JSON.stringify(playlistFromStateVars) !== JSON.stringify(currentPlaylist))
    ) {
        setCurrentPlaylist(playlistFromStateVars || []);
    }

    const lastPlayedId = get(stateVars, "vibin.last_played_id");
    const currentPlaylistIndex = get(stateVars, "vibin.streamer.current_playlist_track_index");

    const mediaSource = get(stateVars, "vibin.streamer.current_audio_source");

    const currentTrack = playlistEntry ?
        {
            artist: playlistEntry.artist || "unknown",
            album: playlistEntry.album || "unknown",
            title: playlistEntry.title || "unknown",
            albumArtURL: playlistEntry["album-art-url"] || "unknown",

        } : undefined;

    return (
        <div className="App">
            <div style={{ marginBottom: "10px" }}>
                {`this is vibin / ${mediaSource}`}
            </div>
            <div className="controls">
                <div style={{ minWidth: 325 }}>
                    <div style={{ marginBottom: "10px" }}>
                        <TransportControls />
                    </div>
                    {currentTrack && <CurrentTrack track={currentTrack} />}
                </div>
                <div className="albums">
                    <Albums lastPlayedId={lastPlayedId} />
                </div>
                <div className="playlist">
                    <Playlist playlist={currentPlaylist} currentIndex={currentPlaylistIndex} />
                </div>
            </div>
            <ReactJson src={stateVars} />
        </div>
    );
}

export default App;

import React from "react";
import he from "he";

function CurrentTrack(props) {
    const track = props.track;

    return (
        <div className="CurrentTrack">
            <div>artist: {he.decode(track.artist)}</div>
            <div>album: {he.decode(track.album)}</div>
            <div>title: {he.decode(track.title)}</div>
            <p />
            <div>
                <img
                    src={track.albumArtURL}
                    alt={track.title}
                    width={300}
                    height={300}
                />
            </div>
        </div>
    );
}

export default CurrentTrack;

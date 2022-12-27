import React from "react";

import useTransport from "../hooks/useTransport";

import "./Albums.css";

function Albums(props) {
    const { lastPlayedId } = props;
    const [albums, setAlbums] = React.useState([]);

    const transport = useTransport();

    React.useEffect(() => {
        const getAlbums = async () => {
            const response = await fetch("/albums");
            const albums = await response.json();
            setAlbums(albums);
        }

        getAlbums();
    }, []);

    return (
        <div className="Albums">
            <table>
                <tbody>
                {
                    albums.sort((a, b) => (a.artist || "Various").localeCompare(b.artist || "Various")).map(album => (
                        <tr key={album.id}>
                            <td
                                className={album.id === lastPlayedId ? "current-album" : undefined}
                            >
                                {album.creator && album.creator !== " " ? album.creator : "Various"}
                            </td>
                            <td
                                className={album.id === lastPlayedId ? "current-album" : undefined}
                            >
                                {album.title}
                            </td>
                            <td>
                                <button onClick={async () => await transport.play(album.id)}>
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

export default Albums;

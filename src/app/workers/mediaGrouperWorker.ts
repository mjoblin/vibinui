import { Album, Track } from "../types";

type MediaGrouperMessageType =
    | "allAlbumsByArtistName"
    | "allTracksByArtistName"
    | "allTracksByAlbumId";

type MediaGrouperMessage = {
    type: MediaGrouperMessageType;
    payload: any;
};

onmessage = (e) => {
    const { type, payload } = e.data as MediaGrouperMessage;

    let result;

    if (type === "allAlbumsByArtistName") {
        result = payload.reduce(
            // @ts-ignore
            (computedAlbumsByArtist, album) => {
                const thisArtist = (album as Album).artist;
                // @ts-ignore
                const currAlbums = computedAlbumsByArtist[thisArtist] ?? [];

                return {
                    ...computedAlbumsByArtist,
                    [thisArtist]: [...currAlbums, album],
                };
            },
            {}
        );
    } else if (type === "allTracksByArtistName") {
        result = payload.reduce(
            // @ts-ignore
            (computedTracksByArtist, track) => {
                const thisArtist = (track as Track).artist;
                // @ts-ignore
                const currTracks = computedTracksByArtist[thisArtist] ?? [];

                return {
                    ...computedTracksByArtist,
                    [thisArtist]: [...currTracks, track],
                };
            },
            {}
        );
    } else if (type === "allTracksByAlbumId") {
        result = payload.reduce(
            // @ts-ignore
            (computedTracksByAlbum, track) => {
                const thisAlbumId = (track as Track).parentId;
                // @ts-ignore
                const currTracks = computedTracksByAlbum[thisAlbumId] ?? [];

                return {
                    ...computedTracksByAlbum,
                    [thisAlbumId]: [...currTracks, track],
                };
            },
            {}
        );
    }

    postMessage({ type, result });
};

export {};

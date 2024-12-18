import { Album, Artist, Track } from "../types";

// ================================================================================================
// A web worker for generating media groupings without blocking the main UI thread.
//
// Media groupings take existing Album/Track/etc data, and munge it into new shapes to make it
// easier for the UI to answer questions like "what is the Album by this id", or "what are all
// the Albums by this Artist".
// ================================================================================================

type MediaGrouperMessageType =
    | "albumById"
    | "allAlbumsByArtistName"
    | "allTracksByArtistName"
    | "allTracksByAlbumId"
    | "artistByName"
    | "trackById";

type MediaGrouperMessage = {
    type: MediaGrouperMessageType;
    payload: any;
};

onmessage = (e) => {
    const { type, payload } = e.data as MediaGrouperMessage;

    let result: any;

    if (type === "albumById") {
        const r: Record<string, Album> = {};

        for (const album of payload) {
            r[album.id] = album;
        }

        result = r;
    } else if (type === "allAlbumsByArtistName") {
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
            {},
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
            {},
        );
    } else if (type === "allTracksByAlbumId") {
        result = payload.reduce(
            // @ts-ignore
            (computedTracksByAlbum, track) => {
                const thisAlbumId = (track as Track).albumId;
                const currTracks = computedTracksByAlbum[thisAlbumId] ?? [];

                return {
                    ...computedTracksByAlbum,
                    [thisAlbumId]: [...currTracks, track],
                };
            },
            {},
        );
    } else if (type === "artistByName") {
        const r: Record<string, Artist> = {};

        for (const artist of payload) {
            r[artist.title] = artist;
        }

        result = r;
    } else if (type === "trackById") {
        const r: Record<string, Track> = {};

        for (const track of payload) {
            r[track.id] = track;
        }

        result = r;
    }

    postMessage({ type, result });
};

export {};

import React, { useEffect, useState } from "react";

import { Album, Track } from "../types";
import { useGetAlbumsQuery } from "../services/vibinAlbums";
import { useGetTracksQuery } from "../services/vibinTracks";

// ================================================================================================
//
// This hook exists as an attempt to improve performance. The goal is to provide information about
// grouped media items (Artists, Albums, Tracks) quickly enough to enable a somewhat responsive UI.
//
// The approach taken here is to take the entire/flat list of Albums, Tracks, etc, and group them
// by some sort of index (Artist Name, Album Id, etc). The initial flat lists are not expected to
// change much, so the reduces performed here are unlikely to be called more than once per session.
//
// There are other ways to retrieve this information which might otherwise be more appropriate. For
// example, an artist's tracks could be retrieved (in a component that wants it) like this instead:
//
// const { artistTracks } = useGetTracksQuery(undefined, {
//     selectFromResult: ({ data }) => ({
//         artistTracks: data?.filter((track) => track.artist === "Artist Name")
//     }),
// });
//
// TODO: Examine the architecture of the app through a performance-focused lens, to see if there's
//  more elegant ways to approach UI responsiveness.
//
// ================================================================================================

export const useMediaGroupings = () => {
    const { data: allAlbums, error: albumsError, isSuccess: albumsIsSuccess } = useGetAlbumsQuery();
    const { data: allTracks, error: tracksError, isSuccess: tracksIsSuccess } = useGetTracksQuery();

    const [albumsByArtistName, setAlbumsByArtistName] = useState<Record<string, Album[]>>({});
    const [tracksByAlbumId, setTracksByAlbumId] = useState<Record<string, Track[]>>({});
    const [tracksByArtistName, setTracksByArtistName] = useState<Record<string, Track[]>>({});

    /**
     *
     */
    useEffect(() => {
        if (!allAlbums) {
            return;
        }

        const results: Record<string, Album[]> = allAlbums.reduce(
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

        setAlbumsByArtistName(results);
    }, [allAlbums]);

    /**
     *
     */
    useEffect(() => {
        if (!allTracks) {
            return;
        }

        const byArtist: Record<string, Track[]> = allTracks.reduce(
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

        const byAlbum: Record<string, Track[]> = allTracks.reduce(
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

        setTracksByArtistName(byArtist);
        setTracksByAlbumId(byAlbum);
    }, [allTracks]);

    // --------------------------------------------------------------------------------------------

    return {
        allAlbumsByArtistName: (artist: string) => albumsByArtistName[artist] || [],
        allTracksByAlbumId: (album: string) => tracksByAlbumId[album] || [],
        allTracksByArtistName: (artist: string) => tracksByArtistName[artist] || [],
    };
};

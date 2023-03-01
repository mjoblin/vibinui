import React, { useEffect, useState } from "react";

import { Album, Track } from "../types";
import { useGetAlbumsQuery } from "../services/vibinAlbums";
import { useGetTracksQuery } from "../services/vibinTracks";

// ================================================================================================
//
// This hook exists as an attempt to improve performance. The goal is to provide information about
// grouped media items (Artists, Albums, Tracks) quickly enough to enable a somewhat responsive UI.
//
// There are other ways to retrieve this information which might otherwise be more appropriate. For
// example, an artist's tracks could be retrieved (in a component that wants it) like this:
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

    const [albumsByArtist, setAlbumsByArtist] = useState<Record<string, Album[]>>({});
    const [tracksByArtist, setTracksByArtist] = useState<Record<string, Track[]>>({});

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

        setAlbumsByArtist(results);
    }, [allAlbums]);

    /**
     *
     */
    useEffect(() => {
        if (!allTracks) {
            return;
        }

        const results: Record<string, Track[]> = allTracks.reduce(
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

        setTracksByArtist(results);
    }, [allTracks]);

    // --------------------------------------------------------------------------------------------

    return {
        allAlbumsByArtist: (artist: string) => albumsByArtist[artist] || [],
        allTracksByArtist: (artist: string) => tracksByArtist[artist] || [],
    };
};

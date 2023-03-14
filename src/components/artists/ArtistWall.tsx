import React, { FC, useEffect, useState } from "react";
import {
    Box,
    Center,
    createStyles,
    Flex,
    Loader,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";

import { Album, Artist, MediaId, Track } from "../../app/types";
import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import { setFilteredArtistCount } from "../../app/store/internalSlice";
import {
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
} from "../../app/store/userSettingsSlice";
import AlbumCard from "../albums/AlbumCard";
import ArtistCard from "./ArtistCard";
import TrackCard from "../tracks/TrackCard";
import SadLabel from "../shared/SadLabel";
import { useMediaGroupings } from "../../app/hooks/useMediaGroupings";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { useGetTracksQuery } from "../../app/services/vibinTracks";

const ArtistWall: FC = () => {
    const { colors } = useMantineTheme();
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppConstants();
    const { data: allArtists, error, isLoading } = useGetArtistsQuery();
    const { data: allTracks } = useGetTracksQuery();
    const { activeCollection, selectedAlbum, selectedArtist, selectedTrack, viewMode } =
        useAppSelector((state: RootState) => state.userSettings.artists);
    const { cardSize, cardGap, filterText } = useAppSelector(
        (state: RootState) => state.userSettings.artists
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const { allAlbumsByArtistName, allTracksByAlbumId, allTracksByArtistName } =
        useMediaGroupings();
    const [artistIdsWithAlbums, setArtistIdsWithAlbums] = useState<MediaId[]>([]);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        artistWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    /**
     *
     */
    useEffect(() => {
        if (!allArtists || artistIdsWithAlbums.length > 0) {
            return;
        }

        // @ts-ignore
        const withAlbums: MediaId[] = allArtists.reduce((accum, artist) => {
            if (allAlbumsByArtistName(artist.title).length > 0) {
                return [...accum, artist.id];
            }

            return accum;
        }, []);

        setArtistIdsWithAlbums(withAlbums);
    }, [allArtists, allAlbumsByArtistName, artistIdsWithAlbums]);

    // --------------------------------------------------------------------------------------------

    if (isLoading) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader size="sm" />
                <Text size={14} weight="bold" pl={10}>
                    Retrieving artists...
                </Text>
            </Center>
        );
    }

    if (error) {
        return (
            <Center pt="xl">
                <SadLabel label="Could not retrieve artist details" />
            </Center>
        );
    }

    if (!allArtists || allArtists.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Artists available" />
            </Center>
        );
    }

    // Determine which artists to display. This is triggered by the "Show" dropdown in the
    // <ArtistsControls> component, and will be one of:
    //
    // 1. All artists.
    // 2. Only artists with 1 or more albums.
    // 3. What's currently playing, in which case limit the artist list to the selected artist
    //      (the ArtistsControls will have set this artist in application state).

    //     const currentArtist = allArtists?.find(
    //         (artist: Artist) => artist.title === currentAlbum?.artist
    //     );

    // --------------------------------------------------------------------------------------------
    // Find the current artist based on the current track. This is a brittle comparison.
    // TODO: Remove this once the app has a notion of a "current artist").

    const currentTrack = allTracks?.find((track) => track.id === currentTrackMediaId);
    const currentArtist: Artist | undefined =
        currentTrack && allArtists.find((artist) => artist.title === currentTrack.artist);
    // --------------------------------------------------------------------------------------------

    const artistsToDisplay: Artist[] =
        activeCollection === "current"
            ? currentArtist
                ? [currentArtist]
                : []
            : allArtists
                  .filter((artist: Artist) => {
                      return activeCollection === "all" || artistIdsWithAlbums.includes(artist.id);
                  })
                  .filter((artist: Artist) => {
                      if (filterText === "") {
                          return true;
                      }

                      const filterValueLower = filterText.toLowerCase();

                      return artist.title.toLowerCase().includes(filterValueLower);
                  });

    dispatch(setFilteredArtistCount(artistsToDisplay.length));

    if (artistsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Artists" />
            </Center>
        );
    }

    // --------------------------------------------------------------------------------------------
    // Main render
    // --------------------------------------------------------------------------------------------

    const minWidth = "25%";

    return viewMode === "art_focused" ? (
        <Box className={dynamicClasses.artistWall}>
            {artistsToDisplay
                .filter((artist) => artist.title.startsWith("H"))
                .map((artist) => (
                    <ArtistCard key={artist.id} type="art_focused" artist={artist} />
                ))}
        </Box>
    ) : (
        <Flex gap={20} pb={15}>
            {/* Artists */}
            <Stack miw={minWidth}>
                <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                    Artist
                </Text>
                <Stack spacing="xs">
                    {/* Artist list */}
                    {artistsToDisplay.map((artist) => (
                        <ArtistCard
                            key={artist.id}
                            type="compact"
                            artist={artist}
                            albums={allAlbumsByArtistName(artist.title)}
                            tracks={allTracksByArtistName(artist.title)}
                            selected={artist.id === selectedArtist?.id}
                            // TODO: Remove isCurentlyPlaying (it's replaced by highlightIfPlaying)
                            //  once the "current artist" notion is properly handled.
                            isCurrentlyPlaying={artist.id === currentArtist?.id}
                            onClick={(artist: Artist) => {
                                dispatch(setArtistsSelectedArtist(artist));
                                dispatch(setArtistsSelectedAlbum(undefined));
                            }}
                        />
                    ))}
                </Stack>
            </Stack>

            {/* Albums */}
            <Stack miw={minWidth}>
                <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                    Albums
                </Text>
                <Stack spacing="xs">
                    {selectedArtist ? (
                        allAlbumsByArtistName(selectedArtist.title).length > 0 ? (
                            // Artist with Albums
                            allAlbumsByArtistName(selectedArtist.title).map((album) => {
                                // console.log(`SELECTED: ${selectedAlbum?.id} -> ${album.id}`);
                                return (
                                    <AlbumCard
                                        key={album.id}
                                        type="compact"
                                        album={album}
                                        tracks={allTracksByAlbumId(album.id)}
                                        selected={album.id === selectedAlbum?.id}
                                        onClick={(album: Album) =>
                                            dispatch(setArtistsSelectedAlbum(album))
                                        }
                                    />
                                );
                            })
                        ) : (
                            // Artist with no Albums
                            <Text
                                size="sm"
                                transform="uppercase"
                                weight="bold"
                                color={colors.dark[3]}
                            >
                                Artist has no Albums
                            </Text>
                        )
                    ) : (
                        <Text size="sm" transform="uppercase" weight="bold" color={colors.dark[3]}>
                            No artist selected
                        </Text>
                    )}
                </Stack>
            </Stack>

            {/* Tracks */}
            <Stack miw={minWidth}>
                <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                    Tracks
                </Text>
                <Stack spacing="xs">
                    {selectedAlbum ? (
                        // Tracks for an Artist + Album selection
                        allTracksByAlbumId(selectedAlbum.id).map((track: Track) => (
                            <TrackCard
                                key={track.id}
                                type="compact"
                                track={track}
                                showArt={false}
                                selected={track.id === selectedTrack?.id}
                                onClick={(track: Track) => dispatch(setArtistsSelectedTrack(track))}
                            />
                        ))
                    ) : selectedArtist &&
                      allAlbumsByArtistName(selectedArtist.title).length <= 0 ? (
                        // Tracks for an Artist with no Albums
                        allTracksByArtistName(selectedArtist.title).map((track: Track) => (
                            <TrackCard
                                key={track.id}
                                type="compact"
                                track={track}
                                showArt={false}
                                selected={track.id === selectedTrack?.id}
                                onClick={(track: Track) => dispatch(setArtistsSelectedTrack(track))}
                            />
                        ))
                    ) : (
                        // Artist has Albums but none are selected
                        <Text size="sm" transform="uppercase" weight="bold" color={colors.dark[3]}>
                            No album selected
                        </Text>
                    )}
                </Stack>
            </Stack>
        </Flex>
    );
};

export default ArtistWall;

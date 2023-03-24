import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Center,
    createStyles,
    Divider,
    Flex,
    ScrollArea,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import get from "lodash/get";
import throttle from "lodash/throttle";

import { Album, Artist, MediaId, Track } from "../../app/types";
import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import {
    setArtistsScrollCurrentIntoView,
    setArtistsScrollPos,
    setArtistsScrollSelectedIntoView,
    setArtistsScrollToCurrentOnScreenEnter,
    setArtistsScrollToSelectedOnScreenEnter,
    setFilteredArtistCount,
} from "../../app/store/internalSlice";
import {
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
} from "../../app/store/userSettingsSlice";
import AlbumCard from "../albums/AlbumCard";
import ArtistCard from "./ArtistCard";
import TrackCard from "../tracks/TrackCard";
import LoadingDataMessage from "../shared/LoadingDataMessage";
import SadLabel from "../shared/SadLabel";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { useGetTracksQuery } from "../../app/services/vibinTracks";
import { store } from "../../app/store/store";

const safeGet = (mediaData: Record<string, any>, key: string) => get(mediaData, key, []);

const SCROLL_POS_DISPATCH_RATE = 500;

const ArtistWall: FC = () => {
    const { colors } = useMantineTheme();
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT, SCREEN_LOADING_PT } = useAppConstants();
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
    const { albumsByArtistName, tracksByAlbumId, tracksByArtistName } = useAppSelector(
        (state: RootState) => state.mediaGroups
    );
    const [artistIdsWithAlbums, setArtistIdsWithAlbums] = useState<MediaId[]>([]);
    const artistsViewport = useRef<HTMLDivElement>(null);
    const albumsViewport = useRef<HTMLDivElement>(null);
    const tracksViewport = useRef<HTMLDivElement>(null);
    const artistSelectedScrollRef = useRef<HTMLDivElement>(null);
    const albumSelectedScrollRef = useRef<HTMLDivElement>(null);
    const trackSelectedScrollRef = useRef<HTMLDivElement>(null);
    const artistCurrentScrollRef = useRef<HTMLDivElement>(null);
    const albumCurrentScrollRef = useRef<HTMLDivElement>(null);
    const trackCurrentScrollRef = useRef<HTMLDivElement>(null);

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
            if (safeGet(albumsByArtistName, artist.title).length > 0) {
                return [...accum, artist.id];
            }

            return accum;
        }, []);

        setArtistIdsWithAlbums(withAlbums);
    }, [allArtists, albumsByArtistName, artistIdsWithAlbums]);

    // --------------------------------------------------------------------------------------------
    // Scroll position restoration.
    //
    // Whenever the <ScrollArea> is updated, the y-position is stored in application state (once
    // each for Artists, Albums, and Tracks). The update rate is throttled by
    // SCROLL_POS_DISPATCH_RATE for performance reasons.
    //
    // When the component is re-mounted, the <ScrollArea> components are reset back to their last
    // recorded position.

    // Store the current scroll positions.
    const throttledArtistsPosChange = useCallback(
        throttle(
            (value) => {
                dispatch(setArtistsScrollPos({ category: "artists", pos: value.y }));
            },
            SCROLL_POS_DISPATCH_RATE,
            { leading: false }
        ),
        []
    );

    const throttledAlbumsPosChange = useCallback(
        throttle(
            (value) => {
                dispatch(setArtistsScrollPos({ category: "albums", pos: value.y }));
            },
            SCROLL_POS_DISPATCH_RATE,
            { leading: false }
        ),
        []
    );

    const throttledTracksPosChange = useCallback(
        throttle(
            (value) => {
                dispatch(setArtistsScrollPos({ category: "tracks", pos: value.y }));
            },
            SCROLL_POS_DISPATCH_RATE,
            { leading: false }
        ),
        []
    );

    // When the Artist Wall mounts, do one of the follow:
    //  * Scroll to the current track if requested.
    //  * Scroll to the selected Artist/Album/Track if requested (this is used by the
    //      navigation options, like "View in Artists" from the Album/Track/etc screens.
    //  * Restore the last-recorded manual scroll positions.
    useEffect(() => {
        const { scrollToCurrentOnScreenEnter, scrollToSelectedOnScreenEnter } =
            store.getState().internal.artists;

        // TODO: Figure out how to properly determine when a scroll can be safely performed. The
        //  setTimeout calls here are a hack which are likely to not work as hoped in different
        //  environments. The goal is to only attempt a scroll once all the scrollable entries are
        //  fully rendered.

        if (scrollToCurrentOnScreenEnter) {
            dispatch(setArtistsScrollToCurrentOnScreenEnter(false));
            setTimeout(() => {
                scrollCurrentIntoView();
            }, 100);
        } else if (scrollToSelectedOnScreenEnter) {
            dispatch(setArtistsScrollToSelectedOnScreenEnter(false));
            setTimeout(() => {
                scrollSelectedIntoView();
            }, 100);
        } else {
            // Restore last-recorded manual scroll positions.
            const {
                artists: artistsScrollPos,
                albums: albumsScrollPos,
                tracks: tracksScrollPos,
            } = store.getState().internal.artists.scrollPos;

            setTimeout(() => {
                artistsViewport.current &&
                    artistsScrollPos &&
                    artistsViewport.current.scrollTo({ top: artistsScrollPos });

                albumsViewport.current &&
                    albumsScrollPos &&
                    albumsViewport.current.scrollTo({ top: albumsScrollPos });

                tracksViewport.current &&
                    tracksScrollPos &&
                    tracksViewport.current.scrollTo({ top: tracksScrollPos });
            }, 1);
        }
    }, []);

    const scrollSelectedIntoView = useCallback(() => {
        artistsViewport.current?.scrollTo({ top: artistSelectedScrollRef.current?.offsetTop });
        albumsViewport.current?.scrollTo({ top: albumSelectedScrollRef.current?.offsetTop });
        tracksViewport.current?.scrollTo({ top: trackSelectedScrollRef.current?.offsetTop });
    }, [
        artistsViewport,
        albumsViewport,
        tracksViewport,
        artistSelectedScrollRef,
        albumSelectedScrollRef,
        trackSelectedScrollRef,
    ]);

    useEffect(() => {
        dispatch(setArtistsScrollSelectedIntoView(scrollSelectedIntoView));
    }, [dispatch, scrollSelectedIntoView]);

    const scrollCurrentIntoView = useCallback(() => {
        artistsViewport.current?.scrollTo({ top: artistCurrentScrollRef.current?.offsetTop });
        albumsViewport.current?.scrollTo({ top: albumCurrentScrollRef.current?.offsetTop });
        tracksViewport.current?.scrollTo({ top: trackCurrentScrollRef.current?.offsetTop });
    }, [
        artistsViewport,
        albumsViewport,
        tracksViewport,
        artistCurrentScrollRef,
        albumCurrentScrollRef,
        trackCurrentScrollRef,
    ]);

    useEffect(() => {
        dispatch(setArtistsScrollCurrentIntoView(scrollCurrentIntoView));
    }, [dispatch, scrollCurrentIntoView]);

    // --------------------------------------------------------------------------------------------

    if (isLoading) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <LoadingDataMessage message="Retrieving artists..." />
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

    // --------------------------------------------------------------------------------------------
    // Find the current artist based on the current track. This is a brittle comparison.
    // TODO: Remove this once the app has a notion of a "current artist").

    const currentTrack = allTracks?.find((track) => track.id === currentTrackMediaId);
    const currentArtist: Artist | undefined =
        currentTrack && allArtists.find((artist) => artist.title === currentTrack.artist);
    // --------------------------------------------------------------------------------------------

    // Determine which artists to display. This is triggered by the "Show" dropdown in the
    // <ArtistsControls> component, and will be one of:
    //
    // 1. All artists.
    // 2. Only artists with 1 or more albums.
    // 3. What's currently playing, in which case limit the artist list to the selected artist
    //      (the ArtistsControls will have set this artist in application state).

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

    return viewMode === "art_focused" ? (
        <Box className={dynamicClasses.artistWall}>
            {artistsToDisplay
                .filter((artist) => artist.title.startsWith("H"))
                .map((artist) => (
                    <ArtistCard key={artist.id} type="art_focused" artist={artist} />
                ))}
        </Box>
    ) : (
        <Flex
            gap={10}
            pb={15}
            sx={{
                height: `calc(100vh - ${HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + 20}px)`,
                overflowY: "hidden",
            }}
        >
            {/* Artists ----------------------------------------------------------------------- */}

            <Stack spacing={10}>
                <Stack spacing={2}>
                    <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                        Artist
                    </Text>
                    <Divider color={colors.dark[6]} pb={0} />
                </Stack>
                <ScrollArea
                    viewportRef={artistsViewport}
                    onScrollPositionChange={throttledArtistsPosChange}
                    offsetScrollbars
                >
                    <Stack spacing="xs">
                        {/* Artist list */}
                        {artistsToDisplay.map((artist) => (
                            <Box
                                key={artist.id}
                                ref={
                                    artist.title === currentArtist?.title
                                        ? artistCurrentScrollRef
                                        : artist.id === selectedArtist?.id
                                        ? artistSelectedScrollRef
                                        : undefined
                                }
                            >
                                <ArtistCard
                                    type="compact"
                                    artist={artist}
                                    albums={safeGet(albumsByArtistName, artist.title)}
                                    tracks={safeGet(tracksByArtistName, artist.title)}
                                    selected={artist.id === selectedArtist?.id}
                                    // TODO: Remove isCurrentlyPlaying (it's replaced by highlightIfPlaying)
                                    //  once the "current artist" notion is properly handled.
                                    isCurrentlyPlaying={artist.id === currentArtist?.id}
                                    onClick={(artist: Artist) => {
                                        dispatch(setArtistsSelectedArtist(artist));
                                        dispatch(setArtistsSelectedAlbum(undefined));
                                    }}
                                />
                            </Box>
                        ))}
                    </Stack>
                </ScrollArea>
            </Stack>

            {/* Albums ------------------------------------------------------------------------ */}

            <Stack spacing={10}>
                <Stack spacing={2}>
                    <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                        Albums
                    </Text>
                    <Divider color={colors.dark[6]} pb={0} />
                </Stack>
                <ScrollArea
                    viewportRef={albumsViewport}
                    onScrollPositionChange={throttledAlbumsPosChange}
                    offsetScrollbars
                >
                    <Stack spacing="xs">
                        {selectedArtist ? (
                            safeGet(albumsByArtistName, selectedArtist.title).length > 0 ? (
                                // Artist with Albums
                                safeGet(albumsByArtistName, selectedArtist.title).map(
                                    (album: Album) => {
                                        return (
                                            <Box
                                                key={album.id}
                                                ref={
                                                    album.id === currentAlbumMediaId
                                                        ? albumCurrentScrollRef
                                                        : album.id === selectedAlbum?.id
                                                        ? albumSelectedScrollRef
                                                        : undefined
                                                }
                                            >
                                                <AlbumCard
                                                    type="compact"
                                                    album={album}
                                                    tracks={safeGet(tracksByAlbumId, album.id)}
                                                    enabledActions={{
                                                        Favorites: ["all"],
                                                        Navigation: [
                                                            "ViewInAlbums",
                                                            "ViewInTracks",
                                                        ],
                                                        Playlist: ["all"],
                                                        Tracks: ["all"],
                                                    }}
                                                    selected={album.id === selectedAlbum?.id}
                                                    onClick={(album: Album) =>
                                                        dispatch(setArtistsSelectedAlbum(album))
                                                    }
                                                />
                                            </Box>
                                        );
                                    }
                                )
                            ) : (
                                // Artist with no Albums
                                <Text
                                    size="sm"
                                    transform="uppercase"
                                    weight="bold"
                                    color={colors.dark[3]}
                                    w={250}
                                >
                                    Artist has no Albums
                                </Text>
                            )
                        ) : (
                            <Text
                                size="sm"
                                transform="uppercase"
                                weight="bold"
                                color={colors.dark[3]}
                                w={250}
                            >
                                No artist selected
                            </Text>
                        )}
                    </Stack>
                </ScrollArea>
            </Stack>

            {/* Tracks ------------------------------------------------------------------------ */}

            <Stack spacing={10}>
                <Stack spacing={2}>
                    <Text transform="uppercase" weight="bold" color={colors.dark[2]}>
                        Tracks
                    </Text>
                    <Divider color={colors.dark[6]} pb={0} />
                </Stack>
                <ScrollArea
                    viewportRef={tracksViewport}
                    onScrollPositionChange={throttledTracksPosChange}
                    offsetScrollbars
                >
                    <Stack spacing="xs">
                        {selectedAlbum ? (
                            // Tracks for an Artist + Album selection
                            safeGet(tracksByAlbumId, selectedAlbum.id).map((track: Track) => (
                                <Box
                                    key={track.id}
                                    ref={
                                        track.id === selectedTrack?.id
                                            ? trackSelectedScrollRef
                                            : undefined
                                    }
                                >
                                    <TrackCard
                                        type="compact"
                                        track={track}
                                        showArt={false}
                                        enabledActions={{
                                            Favorites: ["all"],
                                            Navigation: ["ViewInAlbums", "ViewInTracks"],
                                            Playlist: ["all"],
                                            Tracks: ["all"],
                                        }}
                                        selected={track.id === selectedTrack?.id}
                                        onClick={(track: Track) =>
                                            dispatch(setArtistsSelectedTrack(track))
                                        }
                                    />
                                </Box>
                            ))
                        ) : selectedArtist &&
                          safeGet(albumsByArtistName, selectedArtist.title).length <= 0 ? (
                            // Tracks for an Artist with no Albums
                            safeGet(tracksByArtistName, selectedArtist.title).map(
                                (track: Track) => (
                                    <Box
                                        ref={
                                            track.id === currentTrackMediaId
                                                ? trackCurrentScrollRef
                                                : track.id === selectedTrack?.id
                                                ? trackSelectedScrollRef
                                                : undefined
                                        }
                                    >
                                        <TrackCard
                                            key={track.id}
                                            type="compact"
                                            track={track}
                                            showArt={false}
                                            selected={track.id === selectedTrack?.id}
                                            onClick={(track: Track) =>
                                                dispatch(setArtistsSelectedTrack(track))
                                            }
                                        />
                                    </Box>
                                )
                            )
                        ) : (
                            // Artist has Albums but none are selected, so no Tracks to display
                            <Text
                                size="sm"
                                transform="uppercase"
                                weight="bold"
                                color={colors.dark[3]}
                                w={250}
                            >
                                No album selected
                            </Text>
                        )}
                    </Stack>
                </ScrollArea>
            </Stack>
        </Flex>
    );
};

export default ArtistWall;

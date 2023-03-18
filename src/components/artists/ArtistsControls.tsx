import React, { FC, useCallback, useEffect } from "react";
import {
    Flex,
    Select,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { Album, Artist, MediaId, Track } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    ArtistCollection,
    setArtistsActiveCollection,
    setArtistsFilterText,
} from "../../app/store/userSettingsSlice";
import {
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { useMediaGroupings } from "../../app/hooks/useMediaGroupings";
import { useGetAlbumsQuery } from "../../app/services/vibinAlbums";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import { useGetTracksQuery } from "../../app/services/vibinTracks";

const ArtistsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppConstants();
    const { allAlbumsByArtistName, allTracksByArtistName } = useMediaGroupings();
    const { activeCollection } = useAppSelector((state: RootState) => state.userSettings.artists);
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const { data: allArtists } = useGetArtistsQuery();
    const { data: allTracks } = useGetTracksQuery();
    const { filterText } = useAppSelector((state: RootState) => state.userSettings.artists);
    const { filteredArtistCount } = useAppSelector((state: RootState) => state.internal.artists);

    // --------------------------------------------------------------------------------------------

    /**
     * Determine the album and artist associated with the currently-playing album, set that artist
     * and album to be selected.
     */
    const emitNewSelection = (trackId: MediaId) => {
        // Select the artist, album, and track for the currently-playing album.

        // TODO: Clean this up once "current artist" is available alongside current artist/album;
        //  and once the current media ids are replaced with full Artist/Album/Track objects.
        //
        // NOTE: This attempt to connect the current track id to a track in allTracks is
        //  problematic because the same track can have multiple IDs. This is due to IDs being
        //  unique to their position in the media hierarchy (e.g. a track under an album might
        //  have a different id from that same track browsed to under the alphabetical track
        //  listing).
        //
        // TODO: Figure out whether it's possible to enforce a single unique ID per Album/Track/etc.
        const currentTrack = allTracks?.find((track: Track) => track.id === trackId);
        const artistName = currentTrack?.artist;

        if (!currentTrack || !artistName) {
            return;
        }

        const currentArtist = allArtists?.find((artist: Artist) => artist.title === artistName);

        // currentAlbum might be undefined, which is expected sometimes (e.g. if the current track
        // is from a compilation album where the artist doesn't have any of their own albums).
        const currentAlbum = allAlbumsByArtistName(artistName).find(
            (album: Album) => album.id === currentAlbumMediaId
        );

        if (currentArtist && (currentAlbum || currentTrack)) {
            dispatch(setArtistsFilterText(""));
            dispatch(setArtistsSelectedArtist(currentArtist));
            dispatch(setArtistsSelectedAlbum(currentAlbum));
            dispatch(setArtistsSelectedTrack(currentTrack));
        }

        // // TODO: Clean this up once "current artist" is available alongside current artist/album;
        // //  and once the current media ids are replaced with full Artist/Album/Track objects.
        // const currentArtist = allArtists?.find(
        //     (artist: Artist) => artist.title === currentTrack?.artist
        // );
        //
        // const currentAlbum = allAlbums?.find((album: Album) => album.id === currentAlbumMediaId);
        // const currentTrack = allTracks?.find((track: Track) => track.id === currentTrackMediaId);
        //
        // if (currentArtist && (currentAlbum || currentTrack)) {
        //     dispatch(setArtistsFilterText(""));
        //     dispatch(setArtistsSelectedArtist(currentArtist));
        //     dispatch(setArtistsSelectedAlbum(currentAlbum));
        //     dispatch(setArtistsSelectedTrack(currentTrack));
        // }
    }

    const onArtistCollectionChange = useCallback((value: unknown) => {
        if (!currentTrackMediaId) {
            return;
        }

        value && dispatch(setArtistsActiveCollection(value as ArtistCollection));

        if (value !== "current") {
            dispatch(setArtistsSelectedArtist(undefined));
            dispatch(setArtistsSelectedAlbum(undefined));
            dispatch(setArtistsSelectedTrack(undefined));
            return;
        }

        emitNewSelection(currentTrackMediaId);
    }, [currentTrackMediaId, dispatch]);

    /**
     * If the currently-playing Track id changes and the Artists screen is in "current" mode, then
     * automatically select the current artist, album and track.
     *
     * Reasoning: An album, track, etc, can be played from the Artists screen. When this happens,
     * it seems reasonable to want to reflect the newly-playing media by selecting it in the UI.
     */
    useEffect(() => {
        if (activeCollection === "current" && currentTrackMediaId) {
            emitNewSelection(currentTrackMediaId);
        }
    }, [currentTrackMediaId, activeCollection, allAlbumsByArtistName, allTracksByArtistName]);

    // --------------------------------------------------------------------------------------------

    return (
        <Flex gap={25} align="center">
            {/* Show all or just artists with albums */}
            <Select
                label="Show"
                miw="11rem"
                value={activeCollection}
                data={[
                    { value: "all", label: "All Artists" },
                    { value: "with_albums", label: "Artists with Albums" },
                    { value: "current", label: "Currently Playing" },
                ]}
                onChange={onArtistCollectionChange}
                styles={{
                    ...STYLE_LABEL_BESIDE_COMPONENT,
                    input: {
                        width: 180,
                    }
                }}
            />

            {/* Filter text */}
            <TextInput
                placeholder="Filter by Artist name"
                label="Filter"
                value={filterText}
                disabled={activeCollection === "current"}
                onChange={(event) => dispatch(setArtistsFilterText(event.target.value))}
                styles={{
                    ...STYLE_LABEL_BESIDE_COMPONENT,
                    wrapper: {
                        width: CARD_FILTER_WIDTH,
                    },
                }}
            />

            {/* "Showing x of y artists" */}
            <Flex gap={3} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                <Text size="xs" color={colors.gray[6]}>
                    Showing
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {filteredArtistCount.toLocaleString()}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    of
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {allArtists?.length.toLocaleString() || 0}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    artists
                </Text>
            </Flex>
        </Flex>
    );
};

export default ArtistsControls;

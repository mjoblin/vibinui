import React, { FC, useCallback } from "react";
import { ActionIcon, Box, Flex, Select, TextInput, Tooltip, useMantineTheme } from "@mantine/core";
import { IconHandFinger, IconSquareX } from "@tabler/icons-react";

import { Album, Artist, MediaId, Track } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import {
    ArtistCollection,
    setArtistsActiveCollection,
    setArtistsFilterText,
} from "../../../app/store/userSettingsSlice";
import {
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
    setArtistsSelectedTrack,
} from "../../../app/store/userSettingsSlice";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { useGetArtistsQuery } from "../../../app/services/vibinArtists";
import { useGetTracksQuery } from "../../../app/services/vibinTracks";
import ShowCountLabel from "../../shared/textDisplay/ShowCountLabel";
import CurrentlyPlayingButton from "../../shared/buttons/CurrentlyPlayingButton";

// ================================================================================================
// Controls for the <ArtistsWall>.
//
// Contains:
//  - Selector for Artists to show (all, or just Artists with Albums)
//  - Filter input
//  - Button to scroll to currently-playing Artist/Album/Track
//  - Button to scroll to currently-selected Artist/Album/Track
// ================================================================================================

const ArtistsControls: FC = () => {
    const theme = useMantineTheme();
    const dispatch = useAppDispatch();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const albumsByArtistName = useAppSelector(
        (state: RootState) => state.mediaGroups.albumsByArtistName,
    );
    const { filteredArtistMediaIds, scrollCurrentIntoView, scrollSelectedIntoView } =
        useAppSelector((state: RootState) => state.internal.artists);
    const { activeCollection, filterText, selectedAlbum, selectedArtist, selectedTrack } =
        useAppSelector((state: RootState) => state.userSettings.artists);
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id,
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id,
    );
    const { data: allArtists } = useGetArtistsQuery();
    const { data: allTracks } = useGetTracksQuery();

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
        const currentAlbum = albumsByArtistName[artistName].find(
            (album: Album) => album.id === currentAlbumMediaId,
        );

        if (currentArtist && (currentAlbum || currentTrack)) {
            dispatch(setArtistsFilterText(""));
            dispatch(setArtistsSelectedArtist(currentArtist));
            dispatch(setArtistsSelectedAlbum(currentAlbum));
            dispatch(setArtistsSelectedTrack(currentTrack));
        }
    };

    const onArtistCollectionChange = useCallback(
        (value: unknown) => {
            if (value) {
                dispatch(setArtistsActiveCollection(value as ArtistCollection));
                dispatch(setArtistsFilterText(""));
            }

            if (value !== "current") {
                dispatch(setArtistsSelectedArtist(undefined));
                dispatch(setArtistsSelectedAlbum(undefined));
                dispatch(setArtistsSelectedTrack(undefined));
                return;
            }

            // currentTrackMediaId && emitNewSelection(currentTrackMediaId);
        },
        [dispatch],
    );

    // --------------------------------------------------------------------------------------------

    return (
        <Flex gap={25} align="center" sx={{ flexGrow: 1 }}>
            {/* Show all or just artists with albums */}
            <Select
                label="Show"
                miw="11rem"
                value={activeCollection}
                data={[
                    { value: "all", label: "All Artists" },
                    { value: "with_albums", label: "Artists with Albums" },
                ]}
                onChange={onArtistCollectionChange}
                styles={{
                    ...STYLE_LABEL_BESIDE_COMPONENT,
                    input: {
                        width: 180,
                    },
                }}
            />

            {/* Filter text */}
            <TextInput
                placeholder="Name filter, or advanced"
                label="Filter"
                value={filterText}
                rightSection={
                    <ActionIcon
                        disabled={!filterText}
                        onClick={() => dispatch(setArtistsFilterText(""))}
                    >
                        <IconSquareX size="1.3rem" style={{ display: "block", opacity: 0.5 }} />
                    </ActionIcon>
                }
                onChange={(event) => {
                    dispatch(setArtistsFilterText(event.target.value));

                    // Deselect any selections when the user is interacting with the filter
                    selectedArtist && dispatch(setArtistsSelectedArtist(undefined));
                    selectedAlbum && dispatch(setArtistsSelectedAlbum(undefined));
                    selectedTrack && dispatch(setArtistsSelectedTrack(undefined));
                }}
                styles={{
                    root: {
                        ...STYLE_LABEL_BESIDE_COMPONENT.root,
                        flexGrow: 1,
                    },
                    wrapper: {
                        flexGrow: 1,
                    },
                }}
            />

            <Flex gap={5}>
                {/* Scroll currently-playing items into view */}
                <CurrentlyPlayingButton
                    tooltipLabel="Show currently playing"
                    onClick={() => {
                        currentTrackMediaId && emitNewSelection(currentTrackMediaId);
                        scrollCurrentIntoView();
                    }}
                />

                {/* Scroll selected items into view */}
                <Tooltip label="Scroll selected items into view" position="bottom">
                    <Box>
                        <ActionIcon
                            variant="light"
                            color={theme.primaryColor}
                            disabled={!selectedArtist && !selectedAlbum && !selectedTrack}
                            onClick={scrollSelectedIntoView}
                        >
                            <IconHandFinger size="1rem" />
                        </ActionIcon>
                    </Box>
                </Tooltip>
            </Flex>

            {/* "Showing x of y artists" */}
            <Flex justify="right" sx={{ alignSelf: "flex-end" }}>
                <ShowCountLabel
                    showing={filteredArtistMediaIds.length}
                    of={allArtists?.length || 0}
                    type="artists"
                />
            </Flex>
        </Flex>
    );
};

export default ArtistsControls;

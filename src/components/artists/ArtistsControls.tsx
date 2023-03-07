import React, { FC, SyntheticEvent, useCallback, useEffect } from "react";
import {
    Flex,
    Select,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { Album, Artist } from "../../app/types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    ArtistCollection,
    setArtistsActiveCollection,
    setArtistsFilterText,
} from "../../app/store/userSettingsSlice";
import {
    setArtistsSelectedAlbum,
    setArtistsSelectedArtist,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetAlbumsQuery } from "../../app/services/vibinAlbums";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import GlowTitle from "../shared/GlowTitle";

const ArtistsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { activeCollection } = useAppSelector((state: RootState) => state.userSettings.artists);
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const { data: allAlbums } = useGetAlbumsQuery();
    const { data: allArtists } = useGetArtistsQuery();
    const { filterText } = useAppSelector((state: RootState) => state.userSettings.artists);
    const { filteredArtistCount } = useAppSelector((state: RootState) => state.internal.artists);

    // --------------------------------------------------------------------------------------------

    /**
     * Determine the album and artist associated with the currently-playing album, set that artist
     * and album to be selected.
     */
    const emitNewSelection = () => {
        // Select the artist and album for the currently-playing album.
        const currentAlbum = allAlbums?.find((album: Album) => album.id === currentAlbumMediaId);

        const currentArtist = allArtists?.find(
            (artist: Artist) => artist.title === currentAlbum?.artist
        );

        if (currentArtist && currentAlbum) {
            dispatch(setArtistsFilterText(""));
            dispatch(setArtistsSelectedArtist(currentArtist));
            dispatch(setArtistsSelectedAlbum(currentAlbum));
        }
    }

    const onArtistCollectionChange = useCallback((value: unknown) => {
        value && dispatch(setArtistsActiveCollection(value as ArtistCollection));

        if (value !== "current") {
            dispatch(setArtistsSelectedArtist(undefined));
            dispatch(setArtistsSelectedAlbum(undefined));
            return;
        }

        emitNewSelection();
    }, [allAlbums, allArtists, currentAlbumMediaId, dispatch]);

    /**
     * If the currently-playing Album id changes and the Artists screen is in "current" mode, then
     * automatically select the new album and artist.
     *
     * Reasoning: An album, track, etc, can be played from the Artists screen. When this happens,
     * it seems reasonable to want to reflect the newly-playing media by selecting it in the UI.
     */
    useEffect(() => {
        if (activeCollection === "current") {
            emitNewSelection();
        }
    }, [currentAlbumMediaId, activeCollection]);

    // --------------------------------------------------------------------------------------------

    return (
        <Flex gap={25} align="center">
            <GlowTitle>Artists</GlowTitle>

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
            />

            {/* Filter text */}
            <TextInput
                placeholder="Filter by Artist name"
                label="Filter"
                miw="20rem"
                value={filterText}
                disabled={activeCollection === "current"}
                onChange={(event) => dispatch(setArtistsFilterText(event.target.value))}
            />

            {/* "Showing x of y artists" */}
            <Flex gap={3} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                <Text size="xs" color={colors.gray[6]}>
                    Showing
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {filteredArtistCount}
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

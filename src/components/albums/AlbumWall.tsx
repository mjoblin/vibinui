import React, { FC, useEffect, useRef } from "react";
import { Box, Center, createStyles } from "@mantine/core";

import { Album } from "../../app/types";
import type { RootState } from "../../app/store/store";
import AlbumCard from "./AlbumCard";
import LoadingDataMessage from "../shared/LoadingDataMessage";
import SadLabel from "../shared/SadLabel";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import { setFilteredAlbumMediaIds } from "../../app/store/internalSlice";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { collectionFilter } from "../../app/utils";

type AlbumWallProps = {
    onNewCurrentAlbumRef?: (ref: HTMLDivElement) => void;
}

const AlbumWall: FC<AlbumWallProps> = ({ onNewCurrentAlbumRef }) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppConstants();
    const filterText = useAppSelector((state: RootState) => state.userSettings.albums.filterText);
    const currentAlbumRef = useRef<HTMLDivElement>(null);
    const { activeCollection, cardSize, cardGap } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const { data: allAlbums, error: allError, isLoading: allIsLoading } = useGetAlbumsQuery();
    const { data: newAlbums, error: newError, isLoading: newIsLoading } = useGetNewAlbumsQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    useEffect(() => {
        if (onNewCurrentAlbumRef && currentAlbumRef && currentAlbumRef.current) {
            onNewCurrentAlbumRef(currentAlbumRef.current);
        }
    }, [currentAlbumRef, onNewCurrentAlbumRef, currentAlbumMediaId]);

    if ((activeCollection === "all" && allIsLoading) || (activeCollection === "new" && newIsLoading)) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <LoadingDataMessage message="Retrieving albums..." />
            </Center>
        );
    }

    if ((activeCollection === "all" && allError) || (activeCollection === "new" && newError)) {
        return (
            <Center pt="xl">
                <SadLabel label="Could not retrieve album details" />
            </Center>
        );
    }

    // Decide which collection to show. This will either be all albums; new albums; or just the
    // album currently playing.

    const albumMatchingCurrentlyPlaying = allAlbums?.find(
        (album) => album.id === currentAlbumMediaId
    );

    const collection =
        activeCollection === "all"
            ? allAlbums
            : activeCollection === "new"
            ? newAlbums
            : (albumMatchingCurrentlyPlaying ? [albumMatchingCurrentlyPlaying] : []) as Album[];

    if (!collection || collection.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Albums available" />
            </Center>
        );
    }

    const albumsToDisplay = collectionFilter(collection, filterText, "title");

    dispatch(setFilteredAlbumMediaIds(albumsToDisplay.map((album) => album.id)));

    if (albumsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No matching Albums" />
            </Center>
        );
    }

    return (
        <Box className={dynamicClasses.albumWall}>
            {albumsToDisplay.map((album: Album) =>
                album.id === currentAlbumMediaId ? (
                    <Box ref={currentAlbumRef}>
                        <AlbumCard key={album.id} album={album} />
                    </Box>
                ) : (
                    <AlbumCard key={album.id} album={album} />
                )
            )}
        </Box>
    );
};

export default AlbumWall;

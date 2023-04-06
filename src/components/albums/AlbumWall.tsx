import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import { Box, Center, createStyles, Loader } from "@mantine/core";

import { Album } from "../../app/types";
import type { RootState } from "../../app/store/store";
import AlbumCard from "./AlbumCard";
import LoadingDataMessage from "../shared/LoadingDataMessage";
import SadLabel from "../shared/SadLabel";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import { setFilteredAlbumMediaIds } from "../../app/store/internalSlice";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { collectionFilter } from "../../app/utils";

type AlbumWallProps = {
    onNewCurrentAlbumRef: (ref: RefObject<HTMLDivElement>) => void;
}

const AlbumWall: FC<AlbumWallProps> = ({ onNewCurrentAlbumRef }) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
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
    const [calculatingAlbumsToDisplay, setCalculatingAlbumsToDisplay] = useState<boolean>(true);
    const [albumsToDisplay, setAlbumsToDisplay] = useState<Album[]>([]);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    useEffect(() => {
        if (!allAlbums || allAlbums.length <= 0) {
            return;
        }

        // Decide which collection to show. This will either be all albums; new albums; or just the
        // album currently playing.

        const collection =
            activeCollection === "all" ? allAlbums : activeCollection === "new" ? newAlbums : [];

        const albumsToDisplay = collectionFilter(collection || [], filterText, "title");

        dispatch(setFilteredAlbumMediaIds(albumsToDisplay.map((album) => album.id)));
        setAlbumsToDisplay(albumsToDisplay);
        setCalculatingAlbumsToDisplay(false);
    }, [allAlbums, newAlbums, filterText, activeCollection, dispatch]);

    useEffect(() => {
        onNewCurrentAlbumRef(currentAlbumRef);
    }, []);

    // --------------------------------------------------------------------------------------------

    if (calculatingAlbumsToDisplay) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

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

    if (albumsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label={filterText === "" ? "No Albums available" : "No matching Albums"} />
            </Center>
        );
    }

    // --------------------------------------------------------------------------------------------

    return (
        <Box className={dynamicClasses.albumWall}>
            {albumsToDisplay.map((album: Album) =>
                album.id === currentAlbumMediaId ? (
                    <Box key={album.id} ref={currentAlbumRef}>
                        <AlbumCard album={album} />
                    </Box>
                ) : (
                    <AlbumCard key={album.id} album={album} />
                )
            )}
        </Box>
    );
};

export default AlbumWall;

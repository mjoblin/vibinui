import React, { FC, RefObject, useCallback, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch } from "../../app/hooks";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { setAlbumsActiveCollection, setAlbumsFilterText } from "../../app/store/userSettingsSlice";
import AlbumsControls from "../albums/AlbumsControls";
import AlbumWall from "../albums/AlbumWall";
import ScreenHeader from "./ScreenHeader";

const AlbumsScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const [currentAlbumRef, setCurrentAlbumRef] = useState<RefObject<HTMLDivElement>>();

    /**
     *
     */
    const scrollToCurrent = useCallback(() => {
        if (!currentAlbumRef?.current) {
            return;
        }

        dispatch(setAlbumsActiveCollection("all"));
        dispatch(setAlbumsFilterText(""));

        const buffer = 10;

        const currentAlbumTop =
            currentAlbumRef.current.getBoundingClientRect().top +
            window.scrollY -
            (HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + buffer);

        window.scrollTo({ top: currentAlbumTop });
    }, [currentAlbumRef, HEADER_HEIGHT, SCREEN_HEADER_HEIGHT, dispatch]);

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <AlbumsControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <AlbumWall onNewCurrentAlbumRef={setCurrentAlbumRef} />
            </Box>
        </Stack>
    );
};

export default AlbumsScreen;

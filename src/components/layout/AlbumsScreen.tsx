import React, { FC, useCallback, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch } from "../../app/hooks";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { setAlbumsActiveCollection, setAlbumsFilterText } from "../../app/store/userSettingsSlice";
import AlbumsControls from "../albums/AlbumsControls";
import AlbumWall from "../albums/AlbumWall";
import ScreenHeader from "./ScreenHeader";

const AlbumsScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppConstants();
    const [currentAlbumRef, setCurrentAlbumRef] = useState<HTMLDivElement>();

    /**
     *
     */
    const scrollToCurrent = useCallback(() => {
        dispatch(setAlbumsActiveCollection("all"));
        dispatch(setAlbumsFilterText(""));

        if (currentAlbumRef) {
            const buffer = 10;

            const currentAlbumTop =
                currentAlbumRef.getBoundingClientRect().top +
                window.scrollY -
                (HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + buffer);

            window.scrollTo({ top: currentAlbumTop });
        }
    }, [currentAlbumRef]);

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

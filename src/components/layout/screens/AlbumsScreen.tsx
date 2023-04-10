import React, { FC, RefObject, useCallback, useEffect, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/useInterval";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { RootState } from "../../../app/store/store";
import { setAlbumsActiveCollection, setAlbumsFilterText } from "../../../app/store/userSettingsSlice";
import { useWindowScroll } from "../../../app/hooks/useWindowScroll";
import { setAlbumsScrollPosition } from "../../../app/store/internalSlice";
import AlbumsControls from "../../features/albums/AlbumsControls";
import AlbumsWall from "../../features/albums/AlbumsWall";
import ScreenHeader from "../ScreenHeader";

const AlbumsScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const [currentAlbumRef, setCurrentAlbumRef] = useState<RefObject<HTMLDivElement>>();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.albums);
    const [scroll, scrollTo] = useWindowScroll({ delay: 500 });

    useEffect(() => {
        setTimeout(() => scrollTo({ y: scrollPosition }), 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch(setAlbumsScrollPosition(scroll.y));
    }, [scroll, dispatch]);

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
                <AlbumsWall onNewCurrentAlbumRef={setCurrentAlbumRef} />
            </Box>
        </Stack>
    );
};

export default AlbumsScreen;

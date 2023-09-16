import React, { FC, RefObject, useCallback, useEffect, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { RootState } from "../../app/store/store";
import { setAlbumsActiveCollection, setAlbumsFilterText } from "../../app/store/userSettingsSlice";
import { useWindowScroll } from "../../app/hooks/useWindowScroll";
import { setAlbumsScrollPosition } from "../../app/store/internalSlice";
import AlbumsControls from "./albums/AlbumsControls";
import AlbumsWall from "./albums/AlbumsWall";
import ScreenHeader from "../app/layout/ScreenHeader";

// ================================================================================================
// Albums screen top-level layout.
//
// Contains a <ScreenHeader>, <AlbumsControls>, and <AlbumsWall>.
// ================================================================================================

const AlbumsScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const [currentAlbumRef, setCurrentAlbumRef] = useState<RefObject<HTMLDivElement>>();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.albums);
    const { activeCollection, cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.albums
    );
    const [scroll, scrollTo] = useWindowScroll({ delay: 500 });

    /**
     * Scroll to last-known scroll position when the screen mounts.
     */
    useEffect(() => {
        setTimeout(() => scrollTo({ y: scrollPosition }), 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Update the last-known scroll position when the window scrolls.
     */
    useEffect(() => {
        dispatch(setAlbumsScrollPosition(scroll.y));
    }, [scroll, dispatch]);

    /**
     * Scroll to currently-playing Album. Requires the AlbumsWall to provide a new currentAlbumRef
     * whenever the currently-playing Album changes.
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

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <AlbumsControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <AlbumsWall
                    filterText={filterText}
                    activeCollection={activeCollection}
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    onNewCurrentAlbumRef={setCurrentAlbumRef}
                />
            </Box>
        </Stack>
    );
};

export default AlbumsScreen;

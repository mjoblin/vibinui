import React, { FC, RefObject, useCallback, useEffect, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { RootState } from "../../app/store/store";
import { setTracksFilterText } from "../../app/store/userSettingsSlice";
import { useWindowScroll } from "../../app/hooks/useWindowScroll";
import { setTracksScrollPosition } from "../../app/store/internalSlice";
import TracksControls from "./tracks/TracksControls";
import TracksWall from "./tracks/TracksWall";
import ScreenHeader from "../app/layout/ScreenHeader";

// ================================================================================================
// Tracks screen top-level layout.
//
// Contains a <ScreenHeader>, <TracksControls>, and <TracksWall>.
// ================================================================================================

const TracksScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const [currentTrackRef, setCurrentTrackRef] = useState<RefObject<HTMLDivElement>>();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.tracks);
    const { cardSize, cardGap, filterText, showDetails, wallViewMode } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
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
        dispatch(setTracksScrollPosition(scroll.y));
    }, [scroll, dispatch]);

    /**
     * Scroll to currently-playing Track. Requires the TracksWall to provide a new currentTrackRef
     * whenever the currently-playing Track changes.
     */
    const scrollToCurrent = useCallback(() => {
        if (!currentTrackRef?.current) {
            return;
        }

        dispatch(setTracksFilterText(""));

        const buffer = 10;

        const currentTrackTop =
            currentTrackRef.current.getBoundingClientRect().top +
            window.scrollY -
            (HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + buffer);

        window.scrollTo({ top: currentTrackTop });
    }, [currentTrackRef, HEADER_HEIGHT, SCREEN_HEADER_HEIGHT, dispatch]);

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <TracksControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <TracksWall
                    filterText={filterText}
                    viewMode={wallViewMode}
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    onNewCurrentTrackRef={setCurrentTrackRef}
                />
            </Box>
        </Stack>
    );
};

export default TracksScreen;

import React, { FC, RefObject, useCallback, useEffect, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/useInterval";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { RootState } from "../../../app/store/store";
import { setTracksFilterText } from "../../../app/store/userSettingsSlice";
import { useWindowScroll } from "../../../app/hooks/useWindowScroll";
import { setTracksScrollPosition } from "../../../app/store/internalSlice";
import TracksControls from "../../features/tracks/TracksControls";
import TracksWall from "../../features/tracks/TracksWall";
import ScreenHeader from "../ScreenHeader";

const TracksScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const [currentTrackRef, setCurrentTrackRef] = useState<RefObject<HTMLDivElement>>();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.tracks);
    const [scroll, scrollTo] = useWindowScroll({ delay: 500 });

    useEffect(() => {
        setTimeout(() => scrollTo({ y: scrollPosition }), 1);
    }, []);

    useEffect(() => {
        dispatch(setTracksScrollPosition(scroll.y));
    }, [scroll, dispatch]);

    /**
     *
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

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <TracksControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <TracksWall onNewCurrentTrackRef={setCurrentTrackRef} />
            </Box>
        </Stack>
    );
};

export default TracksScreen;

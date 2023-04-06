import React, { FC, RefObject, useCallback, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { setTracksFilterText } from "../../app/store/userSettingsSlice";
import TracksControls from "../tracks/TracksControls";
import TrackWall from "../tracks/TrackWall";
import ScreenHeader from "./ScreenHeader";
import { RootState } from "../../app/store/store";

const TracksScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const [currentTrackRef, setCurrentTrackRef] = useState<RefObject<HTMLDivElement>>();

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
    }, [currentTrackMediaId, currentTrackRef, HEADER_HEIGHT, SCREEN_HEADER_HEIGHT, dispatch]);

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <TracksControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <TrackWall onNewCurrentTrackRef={setCurrentTrackRef} />
            </Box>
        </Stack>
    );
};

export default TracksScreen;

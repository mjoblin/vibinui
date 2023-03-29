import React, { FC, useCallback, useState } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppDispatch } from "../../app/hooks";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { setTracksFilterText } from "../../app/store/userSettingsSlice";
import TracksControls from "../tracks/TracksControls";
import TrackWall from "../tracks/TrackWall";
import ScreenHeader from "./ScreenHeader";

const TracksScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { HEADER_HEIGHT, SCREEN_HEADER_HEIGHT } = useAppConstants();
    const [currentTrackRef, setCurrentTrackRef] = useState<HTMLDivElement>();

    /**
     *
     */
    const scrollToCurrent = useCallback(() => {
        dispatch(setTracksFilterText(""));

        if (currentTrackRef) {
            const buffer = 10;

            const currentTrackTop =
                currentTrackRef.getBoundingClientRect().top +
                window.scrollY -
                (HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + buffer);

            window.scrollTo({ top: currentTrackTop });
        }
    }, [currentTrackRef]);

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

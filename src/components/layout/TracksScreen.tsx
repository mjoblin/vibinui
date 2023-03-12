import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import TracksControls from "../tracks/TracksControls";
import TrackWall from "../tracks/TrackWall";
import ScreenHeader from "./ScreenHeader";

const TracksScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppConstants();

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <TracksControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <TrackWall />
            </Box>
        </Stack>
    );
};

export default TracksScreen;

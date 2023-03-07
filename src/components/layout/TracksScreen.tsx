import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import TracksControls from "../tracks/TracksControls";
import TrackWall from "../tracks/TrackWall";
import ScreenHeader from "./ScreenHeader";

const TracksScreen: FC = () => {
    const screenHeaderHeight = 90;

    return (
        <Stack spacing={0}>
            <ScreenHeader height={screenHeaderHeight}>
                <TracksControls />
            </ScreenHeader>
            <Box pt={screenHeaderHeight}>
                <TrackWall />
            </Box>
        </Stack>
    );
};

export default TracksScreen;

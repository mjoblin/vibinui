import React, { FC } from "react";
import { Stack } from "@mantine/core";

import TrackWall from "../tracks/TrackWall";
import TracksControls from "../tracks/TracksControls";

const TracksScreen: FC = () => {
    return (
        <Stack spacing="xl">
            <TracksControls />
            <TrackWall />
        </Stack>
    );
};

export default TracksScreen;

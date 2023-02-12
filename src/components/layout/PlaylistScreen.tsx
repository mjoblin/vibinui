import React, { FC } from "react";
import { Stack } from "@mantine/core";

import Playlist from "../playlist/Playlist";
import PlaylistControls from "../playlist/PlaylistControls";

const PlaylistScreen: FC = () => {
    return (
        <Stack spacing="sm">
            <PlaylistControls />
            <Playlist />
        </Stack>
    );
};

export default PlaylistScreen;

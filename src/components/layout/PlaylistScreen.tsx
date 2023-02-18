import React, { FC } from "react";
import { Stack } from "@mantine/core";

import Playlist from "../playlist/Playlist";
import PlaylistControls from "../playlist/PlaylistControls";
import StandbyMode from "../shared/StandbyMode";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

const PlaylistScreen: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);

    return playStatus === "not_ready" ? (
        <StandbyMode />
    ) : (
        <Stack spacing="sm">
            <PlaylistControls />
            <Playlist />
        </Stack>
    );
};

export default PlaylistScreen;

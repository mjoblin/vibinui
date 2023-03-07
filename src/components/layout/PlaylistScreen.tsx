import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import Playlist from "../playlist/Playlist";
import PlaylistControls from "../playlist/PlaylistControls";
import ScreenHeader from "./ScreenHeader";
import StandbyMode from "../shared/StandbyMode";

const PlaylistScreen: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);

    const screenHeaderHeight = 90;

    return playStatus === "not_ready" ? (
        <StandbyMode />
    ) : (
        <Stack spacing={0}>
            <ScreenHeader height={screenHeaderHeight}>
                <PlaylistControls />
            </ScreenHeader>
            <Box pt={screenHeaderHeight}>
                <Playlist />
            </Box>
        </Stack>
    );
};

export default PlaylistScreen;

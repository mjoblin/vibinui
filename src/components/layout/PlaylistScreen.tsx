import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import Playlist from "../playlist/Playlist";
import PlaylistControls from "../playlist/PlaylistControls";
import ScreenHeader from "./ScreenHeader";
import StandbyMode from "../shared/StandbyMode";

const PlaylistScreen: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const { SCREEN_HEADER_HEIGHT } = useAppConstants();

    return playStatus === "not_ready" ? (
        <StandbyMode />
    ) : (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <PlaylistControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <Playlist />
            </Box>
        </Stack>
    );
};

export default PlaylistScreen;

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
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const { SCREEN_HEADER_HEIGHT } = useAppConstants();

    return streamerPower === "off" ? (
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

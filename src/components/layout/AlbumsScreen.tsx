import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import AlbumWall from "../albums/AlbumWall";
import AlbumsControls from "../albums/AlbumsControls";
import ScreenHeader from "./ScreenHeader";

const AlbumsScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppConstants();

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <AlbumsControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <AlbumWall />
            </Box>
        </Stack>
    );
};

export default AlbumsScreen;

import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import AlbumWall from "../albums/AlbumWall";
import AlbumsControls from "../albums/AlbumsControls";
import ScreenHeader from "./ScreenHeader";

const AlbumsScreen: FC = () => {
    const screenHeaderHeight = 90;

    return (
        <Stack spacing={0}>
            <ScreenHeader height={screenHeaderHeight}>
                <AlbumsControls />
            </ScreenHeader>
            <Box pt={screenHeaderHeight}>
                <AlbumWall />
            </Box>
        </Stack>
    );
};

export default AlbumsScreen;

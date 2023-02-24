import React, { FC } from "react";
import { Stack } from "@mantine/core";

import AlbumWall from "../albums/AlbumWall";
import AlbumsControls from "../albums/AlbumsControls";

const AlbumsScreen: FC = () => {
    return (
        <Stack spacing="xl">
            <AlbumsControls />
            <AlbumWall />
        </Stack>
    );
};

export default AlbumsScreen;

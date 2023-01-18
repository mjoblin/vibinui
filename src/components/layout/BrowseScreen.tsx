import React, { FC } from "react";
import { Stack } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";

import AlbumWall from "../albums/AlbumWall";
import BrowseControls from "../albums/BrowseControls";

const BrowseScreen: FC = () => {
    return (
        <Stack spacing="xl">
            <BrowseControls />
            <AlbumWall />
        </Stack>
    );
};

export default BrowseScreen;

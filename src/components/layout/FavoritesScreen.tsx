import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import FavoritesControls from "../favorites/FavoritesControls";
import FavoritesWall from "../favorites/FavoritesWall";
import ScreenHeader from "./ScreenHeader";

const FavoritesScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppConstants();

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <FavoritesControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <FavoritesWall />
            </Box>
        </Stack>
    );
};

export default FavoritesScreen;

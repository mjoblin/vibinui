import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import FavoritesControls from "../favorites/FavoritesControls";
import FavoritesWall from "../favorites/FavoritesWall";
import ScreenHeader from "./ScreenHeader";

const FavoritesScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppGlobals();

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

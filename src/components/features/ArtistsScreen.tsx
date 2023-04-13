import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import ArtistsControls from "./artists/ArtistsControls";
import ArtistsWall from "./artists/ArtistsWall";
import ScreenHeader from "../app/layout/ScreenHeader";

// ================================================================================================
// Artists screen top-level layout.
//
// Contains a <ScreenHeader>, <ArtistsControls>, and <ArtistsWall>.
// ================================================================================================

const ArtistsScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppGlobals();

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <ArtistsControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <ArtistsWall />
            </Box>
        </Stack>
    );
};

export default ArtistsScreen;

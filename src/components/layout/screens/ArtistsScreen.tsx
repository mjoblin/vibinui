import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import ArtistsControls from "../../features/artists/ArtistsControls";
import ArtistsWall from "../../features/artists/ArtistsWall";
import ScreenHeader from "../ScreenHeader";

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

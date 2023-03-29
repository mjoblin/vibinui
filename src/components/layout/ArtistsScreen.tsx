import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import ArtistsControls from "../artists/ArtistsControls";
import ArtistWall from "../artists/ArtistWall";
import ScreenHeader from "./ScreenHeader";

const ArtistsScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppGlobals();

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <ArtistsControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <ArtistWall />
            </Box>
        </Stack>
    );
};

export default ArtistsScreen;

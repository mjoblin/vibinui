import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import ArtistsControls from "../artists/ArtistsControls";
import ArtistWall from "../artists/ArtistWall";
import ScreenHeader from "./ScreenHeader";

const ArtistsScreen: FC = () => {
    const screenHeaderHeight = 90;

    return (
        <Stack spacing={0}>
            <ScreenHeader height={screenHeaderHeight}>
                <ArtistsControls />
            </ScreenHeader>
            <Box pt={screenHeaderHeight}>
                <ArtistWall />
            </Box>
        </Stack>
    );
};

export default ArtistsScreen;

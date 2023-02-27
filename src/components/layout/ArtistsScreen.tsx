import React, { FC } from "react";
import { Stack } from "@mantine/core";

import ArtistWall from "../artists/ArtistWall";
import ArtistsControls from "../artists/ArtistsControls";

const ArtistsScreen: FC = () => {
    return (
        <Stack spacing="xl">
            <ArtistsControls />
            <ArtistWall />
        </Stack>
    );
};

export default ArtistsScreen;

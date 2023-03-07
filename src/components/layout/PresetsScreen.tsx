import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import PresetsControls from "../presets/PresetsControls";
import PresetWall from "../presets/PresetWall";
import ScreenHeader from "./ScreenHeader";

const PresetsScreen: FC = () => {
    const screenHeaderHeight = 90;

    return (
        <Stack spacing={0}>
            <ScreenHeader height={screenHeaderHeight}>
                <PresetsControls />
            </ScreenHeader>
            <Box pt={screenHeaderHeight}>
                <PresetWall />
            </Box>
        </Stack>
    );
};

export default PresetsScreen;

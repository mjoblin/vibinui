import React, { FC } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import PresetsControls from "../presets/PresetsControls";
import PresetWall from "../presets/PresetWall";
import ScreenHeader from "./ScreenHeader";

const PresetsScreen: FC = () => {
    const { SCREEN_HEADER_HEIGHT } = useAppConstants();

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <PresetsControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <PresetWall />
            </Box>
        </Stack>
    );
};

export default PresetsScreen;

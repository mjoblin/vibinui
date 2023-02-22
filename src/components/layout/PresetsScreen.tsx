import React, { FC } from "react";
import { Stack } from "@mantine/core";

import PresetWall from "../presets/PresetWall";
import PresetsControls from "../presets/PresetsControls";

const PresetsScreen: FC = () => {
    return (
        <Stack spacing="xl">
            <PresetsControls />
            <PresetWall />
        </Stack>
    );
};

export default PresetsScreen;

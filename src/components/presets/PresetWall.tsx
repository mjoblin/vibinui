import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import PresetCard from "./PresetCard";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

const PresetWall: FC = () => {
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap } = useAppSelector((state: RootState) => state.userSettings.presets);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetsWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
        isPlaying: {
            border: "2px solid yellow",
        },
    }))();

    return (
        <Box className={dynamicClasses.presetsWall}>
            {presets.map((preset) => (
                <PresetCard preset={preset} />
            ))}
        </Box>
    );
};

export default PresetWall;

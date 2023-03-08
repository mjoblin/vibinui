import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setFilteredPresetCount } from "../../app/store/internalSlice";
import PresetCard from "./PresetCard";

const PresetWall: FC = () => {
    const dispatch = useAppDispatch();
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap } = useAppSelector((state: RootState) => state.userSettings.presets);
    const filterText = useAppSelector((state: RootState) => state.userSettings.presets.filterText);

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetsWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    const presetsToDisplay = presets.filter((preset) => {
        const filterValueLower = filterText.toLowerCase();

        return (
            preset.name.toLowerCase().includes(filterValueLower)
        );
    });

    dispatch(setFilteredPresetCount(presetsToDisplay.length));

    return (
        <Box className={dynamicClasses.presetsWall}>
            {presetsToDisplay.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
            ))}
        </Box>
    );
};

export default PresetWall;

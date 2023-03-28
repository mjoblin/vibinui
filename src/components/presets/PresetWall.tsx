import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { setFilteredPresetIds } from "../../app/store/internalSlice";
import PresetCard from "./PresetCard";
import { collectionFilter } from "../../app/utils";

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

    const presetsToDisplay = collectionFilter(presets, filterText, "name");

    dispatch(setFilteredPresetIds(presetsToDisplay.map((preset) => preset.id)));

    return (
        <Box className={dynamicClasses.presetsWall}>
            {presetsToDisplay.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
            ))}
        </Box>
    );
};

export default PresetWall;

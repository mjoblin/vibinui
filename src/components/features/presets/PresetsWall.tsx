import React, { FC, useEffect, useState } from "react";
import { Box, Center, createStyles, Loader } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { RootState } from "../../../app/store/store";
import { Preset } from "../../../app/services/vibinPresets";
import { setFilteredPresetIds } from "../../../app/store/internalSlice";
import { collectionFilter } from "../../../app/utils";
import PresetCard from "./PresetCard";
import SadLabel from "../../shared/textDisplay/SadLabel";

// ================================================================================================
// Show a wall of Presets art. Reacts to display properties configured via <PresetsControls>.
//
// Presets can be a mix of various media, such as Internet Radio, Albums, etc.
// ================================================================================================

const PresetsWall: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const { presets, haveReceivedInitialState } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap } = useAppSelector((state: RootState) => state.userSettings.presets);
    const filterText = useAppSelector((state: RootState) => state.userSettings.presets.filterText);
    const [presetsToDisplay, setPresetsToDisplay] = useState<Preset[]>([]);

    // NOTE: The PresetWall differs from the Artists/Albums/Tracks walls in that it gets its data
    //  (the presets) directly from the redux state, not from an API call. This is because Presets
    //  are likely to update more often than Artists/Albums/Tracks.

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetsWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    useEffect(() => {
        const presetsToDisplay = collectionFilter(presets, filterText, "name");

        dispatch(setFilteredPresetIds(presetsToDisplay.map((preset) => preset.id)));
        setPresetsToDisplay(presetsToDisplay);
    }, [presets, filterText, dispatch]);
    
    if (!haveReceivedInitialState) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    if (presets.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel label="No Presets found" />
            </Center>
        );
    }

    // --------------------------------------------------------------------------------------------

    return (
        <Box className={dynamicClasses.presetsWall}>
            {presetsToDisplay.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
            ))}
        </Box>
    );
};

export default PresetsWall;

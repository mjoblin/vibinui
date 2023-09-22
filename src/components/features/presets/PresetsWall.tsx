import React, { FC, useEffect, useState } from "react";
import { Box, Center, createStyles, Loader, MantineColor } from "@mantine/core";

import { Preset } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { RootState } from "../../../app/store/store";
import { setFilteredPresetIds } from "../../../app/store/internalSlice";
import { collectionFilter } from "../../../app/utils";
import MediaTable from "../../shared/mediaDisplay/MediaTable";
import PresetCard from "./PresetCard";
import SadLabel from "../../shared/textDisplay/SadLabel";
import { MediaWallViewMode } from "../../../app/store/userSettingsSlice";

// ================================================================================================
// Show a wall of Presets. Wall will be either art cards or a table. Reacts to display properties
// configured via <PresetsControls>.
//
// Presets can be a mix of various media, such as Internet Radio, Albums, etc.
// ================================================================================================

type PresetsWallProps = {
    filterText?: string;
    viewMode?: MediaWallViewMode;
    cardSize?: number;
    cardGap?: number;
    showDetails?: boolean;
    tableStripeColor?: MantineColor;
    quietUnlessShowingPresets?: boolean;
    onIsFilteringUpdate?: (isFiltering: boolean) => void;
    onDisplayCountUpdate?: (displayCount: number) => void;
}

const PresetsWall: FC<PresetsWallProps> = ({
    filterText = "",
    viewMode = "cards",
    cardSize = 50,
    cardGap = 50,
    showDetails = true,
    tableStripeColor,
    quietUnlessShowingPresets = false,
    onIsFilteringUpdate,
    onDisplayCountUpdate,
}) => {
    const dispatch = useAppDispatch();
    const { SCREEN_LOADING_PT } = useAppGlobals();
    const { presets, haveReceivedInitialState } = useAppSelector((state: RootState) => state.presets);
    const [presetsToDisplay, setPresetsToDisplay] = useState<Preset[]>([]);

    // NOTE: The PresetWall differs from the Artists/Albums/Tracks walls in that it gets its data
    //  (the presets) directly from the redux state, not from an API call. This is because Presets
    //  are likely to update more often than Artists/Albums/Tracks.

    const { classes: dynamicClasses } = createStyles((theme) => ({
        cardWall: {
            display: "grid",
            gap: cardGap,
            gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
        tableWall: {
            paddingBottom: 15,
        },
    }))();

    /**
     * Notify parent component of updated display count.
     */
    useEffect(() => {
        onDisplayCountUpdate && onDisplayCountUpdate(presetsToDisplay.length);
    }, [presetsToDisplay, onDisplayCountUpdate]);

    /**
     * Determine which Presets to display based on the current filter text.
     */
    useEffect(() => {
        onIsFilteringUpdate && onIsFilteringUpdate(true);

        const presetsToDisplay = collectionFilter(presets, filterText, "name");

        dispatch(setFilteredPresetIds(presetsToDisplay.map((preset) => preset.id)));
        setPresetsToDisplay(presetsToDisplay);

        onIsFilteringUpdate && onIsFilteringUpdate(false);
    }, [presets, filterText, dispatch, onIsFilteringUpdate]);
    
    if (!haveReceivedInitialState) {
        return (
            <Center pt={SCREEN_LOADING_PT}>
                <Loader variant="dots" size="md" />
            </Center>
        );
    }

    if (quietUnlessShowingPresets && presetsToDisplay.length <= 0) {
        return <></>;
    }

    if (presetsToDisplay.length <= 0) {
        return (
            <Center pt="xl">
                <SadLabel
                    label={filterText === "" ? "No Presets available" : "No matching Presets"}
                />
            </Center>
        );
    }

    // --------------------------------------------------------------------------------------------

    return viewMode === "table" ? (
        <Box className={dynamicClasses.tableWall}>
            <MediaTable
                media={presetsToDisplay}
                columns={["art_url", "name", "type"]}
                stripeColor={tableStripeColor}
                currentlyPlayingId={presets.find((preset) => preset.is_playing)?.id}
            />
        </Box>
    ) : (
        <Box className={dynamicClasses.cardWall}>
            {presetsToDisplay.map((preset) => (
                <PresetCard
                    key={preset.id}
                    preset={preset}
                    size={cardSize}
                    showDetails={showDetails}
                />
            ))}
        </Box>
    );
};

export default PresetsWall;

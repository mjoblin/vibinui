import React, { FC } from "react";
import { ActionIcon, Flex, TextInput } from "@mantine/core";
import { IconSquareX } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import {
    resetPresetsToDefaults,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsFilterText,
    setPresetsShowDetails,
    setPresetsWallViewMode,
} from "../../../app/store/userSettingsSlice";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import CardControls from "../../shared/buttons/CardControls";
import FilterInstructions from "../../shared/textDisplay/FilterInstructions";
import ShowCountLabel from "../../shared/textDisplay/ShowCountLabel";
import MediaWallViewModeSelector from "../../shared/buttons/MediaWallViewModeSelector";

// ================================================================================================
// Controls for the <PresetsWall>.
//
// Contains:
//  - Filter input
//  - Card controls
// ================================================================================================

const PresetsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap, filterText, showDetails, wallViewMode } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );
    const { filteredPresetIds } = useAppSelector((state: RootState) => state.internal.presets);

    return (
        <Flex gap={25} align="center">
            {/* Filter text */}
            <Flex gap={10} align="center" sx={{ flexGrow: 1 }}>
                <TextInput
                    placeholder="Name filter, or advanced"
                    label="Filter"
                    value={filterText}
                    rightSection={
                        <ActionIcon
                            disabled={!filterText}
                            onClick={() => dispatch(setPresetsFilterText(""))}
                        >
                            <IconSquareX size="1.3rem" style={{ display: "block", opacity: 0.5 }} />
                        </ActionIcon>
                    }
                    onChange={(event) => dispatch(setPresetsFilterText(event.target.value))}
                    styles={{
                        root: {
                            ...STYLE_LABEL_BESIDE_COMPONENT.root,
                            flexGrow: 1,
                        },
                        wrapper: {
                            flexGrow: 1,
                        },
                    }}
                />

                <FilterInstructions
                    defaultKey="name"
                    supportedKeys={["name", "type"]}
                    examples={["favorite station", "type:radio", "easy type:radio"]}
                />
            </Flex>

            {/* Toggle between Card and Table views */}
            <MediaWallViewModeSelector
                viewMode={wallViewMode}
                onChange={(viewMode) => dispatch(setPresetsWallViewMode(viewMode))}
            />

            <Flex gap={20} justify="right" sx={{ alignSelf: "flex-end" }}>
                {/* "Showing x of y presets" */}
                <ShowCountLabel
                    showing={filteredPresetIds.length}
                    of={presets?.length || 0}
                    type="presets"
                />

                {/* Card display settings */}
                <CardControls
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    cardSizeSetter={setPresetsCardSize}
                    cardGapSetter={setPresetsCardGap}
                    showDetailsSetter={setPresetsShowDetails}
                    resetter={resetPresetsToDefaults}
                />
            </Flex>
        </Flex>
    );
};

export default PresetsControls;

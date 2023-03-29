import React, { FC } from "react";
import { ActionIcon, Flex, TextInput, useMantineTheme } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    resetPresetsToDefaults,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsFilterText,
    setPresetsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import CardControls from "../shared/CardControls";
import FilterInstructions from "../shared/FilterInstructions";
import { IconSquareX } from "@tabler/icons";
import ShowCountLabel from "../shared/ShowCountLabel";

const PresetsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );
    const { filteredPresetIds } = useAppSelector((state: RootState) => state.internal.presets);

    return (
        <Flex gap={25} align="center">
            {/* Filter text */}
            <Flex gap={10} align="center">
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
                        ...STYLE_LABEL_BESIDE_COMPONENT,
                        wrapper: {
                            width: CARD_FILTER_WIDTH,
                        },
                    }}
                />

                <FilterInstructions
                    defaultKey="name"
                    supportedKeys={["name", "type"]}
                    examples={["favorite station", "type:radio", "easy type:radio"]}
                />
            </Flex>

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
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

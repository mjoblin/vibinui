import React, { FC } from "react";
import { Flex, Text, TextInput, useMantineTheme } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    resetPresetsToDefaults,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsFilterText,
    setPresetsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import CardControls from "../shared/CardControls";
import FilterInstructions from "../shared/FilterInstructions";

const PresetsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppConstants();
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );
    const { filteredPresetCount } = useAppSelector((state: RootState) => state.internal.presets);

    return (
        <Flex gap={25} align="center">
            {/* Filter text */}
            <Flex gap={10} align="center">
                <TextInput
                    placeholder="Filter by Preset name"
                    label="Filter"
                    value={filterText}
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
                <Flex gap={3} align="flex-end">
                    <Text size="xs" color={colors.gray[6]}>
                        Showing
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {filteredPresetCount.toLocaleString()}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        of
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {presets?.length.toLocaleString() || 0}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        presets
                    </Text>
                </Flex>

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

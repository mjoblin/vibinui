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
import CardControls from "../shared/CardControls";

const PresetsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );
    const { filteredPresetCount } = useAppSelector((state: RootState) => state.internal.presets);

    return (
        <Flex gap={25} align="center">
            {/* Filter text */}
            <TextInput
                placeholder="Filter by Preset title"
                label="Filter"
                miw="20rem"
                value={filterText}
                onChange={(event) => dispatch(setPresetsFilterText(event.target.value))}
            />

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

import React, { FC } from "react";
import { Box, Button, Checkbox, Flex, Slider, Stack, Text } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    minPresetCardGap,
    maxPresetCardGap,
    minPresetCardSize,
    maxPresetCardSize,
    resetPresetsToDefaults,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";

const PresetsControls: FC = () => {
    const dispatch = useAppDispatch();
    const { cardSize, cardGap, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );

    return (
        <Flex gap={25}>
            {/* Preset size */}
            <Stack spacing={5} pt={1}>
                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Preset size
                </Text>
                <Slider
                    label={null}
                    min={minPresetCardSize}
                    max={maxPresetCardSize}
                    size={5}
                    sx={{ width: 200 }}
                    value={cardSize}
                    onChange={(value) => dispatch(setPresetsCardSize(value))}
                />
            </Stack>

            {/* Preset gap */}
            <Stack spacing={5} pt={1}>
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Separation
                </Text>
                <Slider
                    label={null}
                    min={minPresetCardGap}
                    max={maxPresetCardGap}
                    size={5}
                    sx={{ width: 200 }}
                    value={cardGap}
                    onChange={(value) => dispatch(setPresetsCardGap(value))}
                />
            </Stack>

            <Box pt={8} sx={{ alignSelf: "center" }}>
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(event) => dispatch(setPresetsShowDetails(!showDetails))}
                />
            </Box>

            <Flex gap={10}>
                {/* Reset to defaults */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => dispatch(resetPresetsToDefaults())}
                    >
                        Reset
                    </Button>
                </Box>
            </Flex>
        </Flex>
    );
};

export default PresetsControls;

import React, { FC } from "react";
import { Box, Button, Flex, Slider, Stack, Text, TextInput } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    resetBrowseToDefaults,
    setBrowseCoverGap,
    setBrowseCoverSize,
    setFilterText,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";

const BrowseControls: FC = () => {
    const dispatch = useAppDispatch();
    const { coverSize, coverGap } = useAppSelector((state: RootState) => state.userSettings.browse);

    return (
        <Flex gap={25}>
            {/* Filter text */}
            <TextInput
                placeholder="Filter text"
                label="Filter"
                onChange={(event) => dispatch(setFilterText(event.target.value))}
            />

            {/* Cover size */}
            <Stack spacing="xs">
                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Cover size
                </Text>
                <Slider
                    label={null}
                    min={100}
                    max={300}
                    sx={{ width: 200 }}
                    value={coverSize}
                    onChange={(value) => dispatch(setBrowseCoverSize(value))}
                />
            </Stack>

            {/* Cover gap */}
            <Stack spacing="xs">
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Gap
                </Text>
                <Slider
                    label={null}
                    min={0}
                    max={50}
                    sx={{ width: 200 }}
                    value={coverGap}
                    onChange={(value) => dispatch(setBrowseCoverGap(value))}
                />
            </Stack>

            {/* Reset to defaults */}
            <Box sx={{ alignSelf: "center" }}>
                <Button
                    compact
                    variant="outline"
                    size="xs"
                    onClick={() => dispatch(resetBrowseToDefaults())}
                >
                    Reset
                </Button>
            </Box>
        </Flex>
    );
};

export default BrowseControls;

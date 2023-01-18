import React, { FC } from "react";
import { Box, Button, Checkbox, Flex, Slider, Stack, Text, TextInput } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    resetBrowseToDefaults,
    setBrowseCoverGap,
    setBrowseCoverSize,
    setBrowseShowDetails,
    setFilterText,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";

const BrowseControls: FC = () => {
    const dispatch = useAppDispatch();
    const {  coverSize, coverGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.browse
    );

    // TODO: Improve the alignment of these various controls. Currently there's a lot of hackery of
    //  the tops of components to get them to look OK.

    return (
        <Flex gap={25}>
            {/* Filter text */}
            <TextInput
                placeholder="Filter text"
                label="Filter"
                value={filterText}
                onChange={(event) => dispatch(setFilterText(event.target.value))}
            />

            {/* Cover size */}
            <Stack spacing={5} pt={1}>
                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Album size
                </Text>
                <Slider
                    label={null}
                    min={100}
                    max={300}
                    size={5}
                    sx={{ width: 200 }}
                    value={coverSize}
                    onChange={(value) => dispatch(setBrowseCoverSize(value))}
                />
            </Stack>

            {/* Cover gap */}
            <Stack spacing={5} pt={1}>
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Separation
                </Text>
                <Slider
                    label={null}
                    min={0}
                    max={50}
                    size={5}
                    sx={{ width: 200 }}
                    value={coverGap}
                    onChange={(value) => dispatch(setBrowseCoverGap(value))}
                />
            </Stack>

            <Box pt={8} sx={{ alignSelf: "center" }}>
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(event) => dispatch(setBrowseShowDetails(!showDetails))}
                />
            </Box>

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

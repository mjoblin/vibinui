import React, { FC } from "react";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Slider,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    minCoverGap,
    maxCoverGap,
    minCoverSize,
    maxCoverSize,
    resetTracksToDefaults,
    setTracksCoverGap,
    setTracksCoverSize,
    setTracksFilterText,
    setTracksShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetTracksQuery } from "../../app/services/vibinTracks";
import GlowTitle from "../shared/GlowTitle";

const TracksControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { data: allTracks } = useGetTracksQuery();
    const { coverSize, coverGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
    );
    const { filteredTrackCount } = useAppSelector((state: RootState) => state.internal.tracks);

    return (
        <Flex gap={25} align="center">
            <GlowTitle>Tracks</GlowTitle>

            {/* Filter text */}
            {/* TODO: Consider debouncing setTracksFilterText() if performance is an issue */}
            <TextInput
                placeholder="Filter text"
                label="Filter"
                value={filterText}
                onChange={(event) => dispatch(setTracksFilterText(event.target.value))}
            />

            {/* Cover size */}
            <Stack spacing={5} pt={1}>
                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Art size
                </Text>
                <Slider
                    label={null}
                    min={minCoverSize}
                    max={maxCoverSize}
                    size={5}
                    sx={{ width: 200 }}
                    value={coverSize}
                    onChange={(value) => dispatch(setTracksCoverSize(value))}
                />
            </Stack>

            {/* Cover gap */}
            <Stack spacing={5} pt={1}>
                <Text size="sm" sx={{ fontWeight: 500 }}>
                    Separation
                </Text>
                <Slider
                    label={null}
                    min={minCoverGap}
                    max={maxCoverGap}
                    size={5}
                    sx={{ width: 200 }}
                    value={coverGap}
                    onChange={(value) => dispatch(setTracksCoverGap(value))}
                />
            </Stack>

            <Box pt={8} sx={{ alignSelf: "center" }}>
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(event) => dispatch(setTracksShowDetails(!showDetails))}
                />
            </Box>

            <Flex gap={10}>
                {/* Reset to defaults */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => dispatch(resetTracksToDefaults())}
                    >
                        Reset
                    </Button>
                </Box>

                {/* Show a "tiny wall" preset */}
                <Box sx={{ alignSelf: "center" }}>
                    <Button
                        compact
                        variant="outline"
                        size="xs"
                        onClick={() => {
                            dispatch(setTracksCoverGap(minCoverGap));
                            dispatch(setTracksCoverSize(minCoverSize));
                            dispatch(setTracksShowDetails(false));
                        }}
                    >
                        Tiny Wall
                    </Button>
                </Box>
            </Flex>

            {/* "Showing x of y tracks" */}
            <Flex gap={3} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                <Text size="xs" color={colors.gray[6]}>
                    Showing
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {filteredTrackCount}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    of
                </Text>
                <Text size="xs" color={colors.gray[6]} weight="bold">
                    {allTracks?.length || 0}
                </Text>
                <Text size="xs" color={colors.gray[6]}>
                    tracks
                </Text>
            </Flex>
        </Flex>
    );
};

export default TracksControls;

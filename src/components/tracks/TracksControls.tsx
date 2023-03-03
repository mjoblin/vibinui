import React, { FC } from "react";
import { Flex, Text, TextInput, useMantineTheme } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    resetTracksToDefaults,
    setTracksCardGap,
    setTracksCardSize,
    setTracksFilterText,
    setTracksShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetTracksQuery } from "../../app/services/vibinTracks";
import GlowTitle from "../shared/GlowTitle";
import CardControls from "../shared/CardControls";

const TracksControls: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { data: allTracks } = useGetTracksQuery();
    const { cardSize, cardGap, filterText, showDetails } = useAppSelector(
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
                miw="20rem"
                value={filterText}
                onChange={(event) => dispatch(setTracksFilterText(event.target.value))}
            />

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y tracks" */}
                <Flex gap={3} align="flex-end">
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

                {/* Card display settings */}
                <CardControls
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    cardSizeSetter={setTracksCardSize}
                    cardGapSetter={setTracksCardGap}
                    showDetailsSetter={setTracksShowDetails}
                    resetter={resetTracksToDefaults}
                />
            </Flex>
        </Flex>
    );
};

export default TracksControls;

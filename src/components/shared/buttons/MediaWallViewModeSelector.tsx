import React, { FC } from "react";
import { ActionCreator } from "@reduxjs/toolkit";
import { Center, SegmentedControl, Text } from "@mantine/core";
import { IconGridDots, IconMenu2 } from "@tabler/icons";

import { useAppDispatch } from "../../../app/hooks/store";
import { MediaWallViewMode } from "../../../app/store/userSettingsSlice";

// ================================================================================================
// Toggle to switch between media wall view modes.
// ================================================================================================

type MediaWallViewModeSelectorProps = {
    viewMode: MediaWallViewMode;
    viewModeSetter?: ActionCreator<any>;
};

const MediaWallViewModeSelector: FC<MediaWallViewModeSelectorProps> = ({ viewMode, viewModeSetter }) => {
    const dispatch = useAppDispatch();

    return (
        <SegmentedControl
            value={viewMode}
            radius={5}
            onChange={(value) => viewModeSetter && dispatch(viewModeSetter(value))}
            data={[
                {
                    value: "cards",
                    label: (
                        <Center>
                            <IconGridDots size={14} />
                            <Text size={14} ml={10}>
                                Cards
                            </Text>
                        </Center>
                    ),
                },
                {
                    value: "table",
                    label: (
                        <Center>
                            <IconMenu2 size={14} />
                            <Text size={14} ml={10}>
                                Table
                            </Text>
                        </Center>
                    ),
                },
            ]}
        />
    );
};

export default MediaWallViewModeSelector;

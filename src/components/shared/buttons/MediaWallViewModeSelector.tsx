import React, { FC } from "react";
import { Center, SegmentedControl } from "@mantine/core";
import { IconGridDots, IconMenu2 } from "@tabler/icons";

import { MediaWallViewMode } from "../../../app/store/userSettingsSlice";

// ================================================================================================
// Toggle to switch between media wall view modes.
// ================================================================================================

type MediaWallViewModeProps = {
    viewMode: MediaWallViewMode;
    onChange?: (viewMode: MediaWallViewMode) => void;
};

const MediaWallViewModeSelector: FC<MediaWallViewModeProps> = ({ viewMode, onChange }) => {
    return (
        <SegmentedControl
            value={viewMode}
            radius={5}
            onChange={(value) => onChange && onChange(value as MediaWallViewMode)}
            data={[
                {
                    value: "cards",
                    label: (
                        <Center>
                            <IconGridDots size={14} />
                        </Center>
                    ),
                },
                {
                    value: "table",
                    label: (
                        <Center>
                            <IconMenu2 size={14} />
                        </Center>
                    ),
                },
            ]}
        />
    );
};

export default MediaWallViewModeSelector;

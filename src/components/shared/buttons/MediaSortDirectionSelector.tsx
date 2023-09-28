import React, { FC } from "react";
import { ActionCreator } from "@reduxjs/toolkit";
import { SegmentedControl } from "@mantine/core";

import { useAppDispatch } from "../../../app/hooks/store";
import { MediaSortDirection } from "../../../app/store/userSettingsSlice";

// ================================================================================================
// Toggle to switch between media wall view modes (table or cards).
// ================================================================================================

type MediaSortDirectionSelectorProps = {
    activeDirection: MediaSortDirection;
    activeDirectionSetter?: ActionCreator<any>;
};

const MediaSortDirectionSelector: FC<MediaSortDirectionSelectorProps> = ({
    activeDirection,
    activeDirectionSetter,
}) => {
    const dispatch = useAppDispatch();

    return (
        <SegmentedControl
            orientation="vertical"
            value={activeDirection}
            radius={5}
            onChange={(value) => activeDirectionSetter && dispatch(activeDirectionSetter(value))}
            data={[
                {
                    value: "ascending",
                    label: "ascending",
                },
                {
                    value: "descending",
                    label: "descending",
                },
            ]}
        />
    );
};

export default MediaSortDirectionSelector;

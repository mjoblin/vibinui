import React, { FC } from "react";
import { ActionCreator } from "@reduxjs/toolkit";
import { SegmentedControl } from "@mantine/core";

import { useAppDispatch } from "../../../app/hooks/store";

// ================================================================================================
// Toggle to choose which media field to sort by.
// ================================================================================================

type MediaSortFieldSelectorProps = {
    fields: string[];
    activeField: string;
    activeFieldSetter?: ActionCreator<any>;
};

const MediaSortFieldSelector: FC<MediaSortFieldSelectorProps> = ({
    fields,
    activeField,
    activeFieldSetter,
}) => {
    const dispatch = useAppDispatch();

    return (
        <SegmentedControl
            orientation="vertical"
            value={activeField}
            radius={5}
            onChange={(value) => activeFieldSetter && dispatch(activeFieldSetter(value))}
            data={fields.map((field) => ({
                value: field,
                label: field,
            }))}
        />
    );
};

export default MediaSortFieldSelector;

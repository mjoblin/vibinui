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

    const segments = fields.map((field) => ({
        value: field,
        label: field === "date" ? "year" : field, // Force "year" display for date field
    }));

    return (
        <SegmentedControl
            orientation="vertical"
            value={activeField}
            radius={5}
            onChange={(value) => activeFieldSetter && dispatch(activeFieldSetter(value))}
            data={segments.sort((a, b) => a.label.localeCompare(b.label))}
        />
    );
};

export default MediaSortFieldSelector;

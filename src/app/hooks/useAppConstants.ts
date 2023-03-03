import React from "react";
import { useMantineTheme } from "@mantine/core";

export const useAppConstants = () => {
    const { colors } = useMantineTheme();

    return {
        SELECTED_COLOR: colors.yellow[4],
    };
};

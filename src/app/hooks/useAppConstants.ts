import React from "react";
import { useMantineTheme } from "@mantine/core";

export const useAppConstants = () => {
    const { colors } = useMantineTheme();

    return {
        APP_URL_PREFIX: "/ui",
        HEADER_HEIGHT: 60,
        NAVBAR_PADDING: "md",
        NAVBAR_WIDTH: 230,
        SELECTED_COLOR: colors.yellow[4],
    };
};

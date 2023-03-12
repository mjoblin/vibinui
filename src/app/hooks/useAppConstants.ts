import React from "react";
import { useMantineTheme } from "@mantine/core";

export const useAppConstants = () => {
    const { colors } = useMantineTheme();

    return {
        APP_ALT_FONTFACE: "Kanit",
        APP_URL_PREFIX: "/ui",
        APP_MODAL_BLUR: 0.5,
        CARD_FILTER_WIDTH: 275,
        CURRENTLY_PLAYING_COLOR: colors.yellow[4],
        HEADER_HEIGHT: 60,
        NAVBAR_PADDING: "md",
        NAVBAR_WIDTH: 230,
        SCREEN_LOADING_PT: 25,
        SCREEN_HEADER_HEIGHT: 70,
        SELECTED_COLOR: "rgba(25, 113, 194, 0.2)",
        STYLE_LABEL_BESIDE_COMPONENT: {
            root: {
                display: "flex",
                gap: 7,
                alignItems: "center",
            },
        },
        TEMPORARY_ACTIVITY_COLOR: colors.yellow[4],
    };
};

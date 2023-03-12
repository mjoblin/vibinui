import React from "react";
import { useMantineTheme } from "@mantine/core";

export const useAppConstants = () => {
    const { colors } = useMantineTheme();

    return {
        APP_ALT_FONTFACE: "Kanit",
        APP_URL_PREFIX: "/ui",
        APP_MODAL_BLUR: 0.5,
        HEADER_HEIGHT: 60,
        NAVBAR_PADDING: "md",
        NAVBAR_WIDTH: 230,
        SCREEN_LOADING_PT: 25,
        SELECTED_COLOR: colors.yellow[4],
        SCREEN_HEADER_HEIGHT: 70,
        CARD_FILTER_WIDTH: 275,
        STYLE_LABEL_BESIDE_COMPONENT: {
            root: {
                display: "flex",
                gap: 7,
                alignItems: "center",
            },
        },
    };
};

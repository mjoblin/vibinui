import React, { FC, ReactNode } from "react";
import { createStyles, MantineColor, Text } from "@mantine/core";

import { useAppGlobals } from "../../../app/hooks/useAppGlobals";

// ================================================================================================
// A text label using the application's alternate font.
// ================================================================================================

type StylizedLabelProps = {
    color?: MantineColor;
    size?: number;
    children: ReactNode;
};

const StylizedLabel: FC<StylizedLabelProps> = ({ color, size = 30, children }) => {
    const { APP_ALT_FONTFACE } = useAppGlobals();

    const { classes: dynamicClasses } = createStyles(() => ({
        screenName: {
            fontFamily: APP_ALT_FONTFACE,
            textTransform: "lowercase",
        },
    }))();

    return (
        <Text size={size} weight="bold" color={color} className={dynamicClasses.screenName}>
            {children}
        </Text>
    );
};

export default StylizedLabel;

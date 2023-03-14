import React, { FC, ReactNode } from "react";
import { createStyles, MantineColor, Text } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";

type StylizedLabelProps = {
    color?: MantineColor;
    children: ReactNode;
};

const StylizedLabel: FC<StylizedLabelProps> = ({ color, children }) => {
    const { APP_ALT_FONTFACE } = useAppConstants();

    const { classes: dynamicClasses } = createStyles(() => ({
        screenName: {
            fontFamily: APP_ALT_FONTFACE,
            textTransform: "lowercase",
        },
    }))();

    return (
        <Text size={30} weight="bold" color={color} className={dynamicClasses.screenName}>
            {children}
        </Text>
    );
};

export default StylizedLabel;

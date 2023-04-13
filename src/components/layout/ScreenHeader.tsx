import React, { FC, ReactNode } from "react";
import { Box, createStyles, rem } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";

// ================================================================================================
// A per-screen/feature Header. Often used to hold screen-specific user controls like filters,
// toggles, etc.
// ================================================================================================

type ScreenHeaderProps = {
    height: number;
    noBackground?: boolean;
    children: ReactNode;
};

const ScreenHeader: FC<ScreenHeaderProps> = ({ height, noBackground = false, children }) => {
    const { HEADER_HEIGHT, NAVBAR_WIDTH } = useAppGlobals();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        header: {
            position: "fixed",
            background: noBackground
                ? "rgb(0, 0, 0, 0)"
                : theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.white,
            height,
            zIndex: 100,
            top: HEADER_HEIGHT,
            left: NAVBAR_WIDTH,
            right: 0,
            paddingLeft: theme.spacing.md,
            paddingRight: theme.spacing.md,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            borderBottom: `${rem(1)} solid ${
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
            }`,
        },
    }))();

    return <Box className={dynamicClasses.header}>{children}</Box>;
};

export default ScreenHeader;

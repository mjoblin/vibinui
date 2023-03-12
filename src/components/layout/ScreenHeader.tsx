import React, { FC, ReactNode } from "react";
import { Box, createStyles, rem } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";

type ScreenHeaderProps = {
    height: number;
    children: ReactNode;
};

const ScreenHeader: FC<ScreenHeaderProps> = ({ height, children }) => {
    const { HEADER_HEIGHT, NAVBAR_WIDTH } = useAppConstants();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        header: {
            position: "fixed",
            height,
            zIndex: 100,
            top: HEADER_HEIGHT,
            left: NAVBAR_WIDTH,
            right: 0,
            paddingLeft: theme.spacing.md,
            paddingRight: theme.spacing.md,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            background: theme.colors.dark[8],
            borderBottom: `${rem(1)} solid ${
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
            }`,
        },
    }))();

    return <Box className={dynamicClasses.header}>{children}</Box>;
};

export default ScreenHeader;

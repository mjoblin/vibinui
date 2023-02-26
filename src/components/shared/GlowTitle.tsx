import React, { FC } from "react";
import { createStyles, Text } from "@mantine/core";

const useStyles = createStyles(({ colors }) => ({
    glow: {
        color: colors.gray[5],
        textTransform: "uppercase",
        textShadow: `0 0 1px ${colors.gray[4]}, 0 0 3px #15A015, 0 0 80px #D4D4D4`,
    },
}));

type GlowTitleProps = {
    children: React.ReactNode;
};

const GlowTitle: FC<GlowTitleProps> = ({ children }) => {
    const { classes } = useStyles();

    return (
        <Text size={30} weight="bold" className={classes.glow}>
            {children}
        </Text>
    );
};

export default GlowTitle;

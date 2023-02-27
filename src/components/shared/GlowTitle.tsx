import React, { FC } from "react";
import { createStyles, Text } from "@mantine/core";

type GlowTitleProps = {
    color?: string;
    children: React.ReactNode;
};

const GlowTitle: FC<GlowTitleProps> = ({ color, children }) => {
    const { classes: dynamicClasses } = createStyles(({ colors }) => ({
        glow: {
            color: colors.gray[5],
            textTransform: "uppercase",
            textShadow: `0 0 1px ${colors.gray[4]}, 0 0 3px ${color || "#15A015"}, 0 0 80px #D4D4D4`,
        },
    }))();

    return (
        <Text size={30} weight="bold" className={dynamicClasses.glow}>
            {children}
        </Text>
    );
};

export default GlowTitle;

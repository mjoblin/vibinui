import React, { FC, ReactNode } from "react";
import { Box, Center, createStyles } from "@mantine/core";
import { TablerIcon } from "@tabler/icons";

// TODO: This is really just a simple Button. It might benefit from extending <Button> instead.

type VibinIconButtonProps = {
    icon: TablerIcon;
    size?: number;
    container?: boolean;
    fill?: boolean;
    onClick?: () => void;
};

const VibinIconButton: FC<VibinIconButtonProps> = ({
    icon,
    size = 15,
    container = true,
    fill = false,
    onClick,
}) => {
    const { classes: dynamicClasses } = createStyles((theme, _params, getRef) => ({
        playButtonContainer: {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: "rgb(255, 255, 255, 0.2)",
            transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
            "&:hover": {
                cursor: "pointer",
                backgroundColor: theme.colors.blue,
            },
            [`&:hover .${getRef("button")}`]: {
                color: theme.colors.gray[1],
                fill: fill ? theme.colors.gray[1] : undefined,
            },
        },
        button: {
            ref: getRef("button"),
            color: theme.colors.gray[5],
            fill: fill ? theme.colors.gray[5] : undefined,
            transition: "color .2s ease-in-out, fill .2s ease-in-out",
            "&:hover": {
                cursor: "pointer",
                color: theme.colors.gray[1],
                fill: fill ? theme.colors.gray[1] : undefined,
            },
        },
    }))();

    // TODO: Is there a way to keep TS happy here.
    // @ts-ignore
    const iconComponent: ReactNode = new icon({
        className: dynamicClasses.button,
        size,
        stroke: 1,
    });

    return container ? (
        <Center
            onClick={(event) => {
                event.stopPropagation();
                onClick && onClick();
            }}
            className={dynamicClasses.playButtonContainer}
        >
            {iconComponent}
        </Center>
    ) : (
        <Box
            onClick={(event) => {
                event.stopPropagation();
                onClick && onClick();
            }}
        >
            {iconComponent}
        </Box>
    );
};

export default VibinIconButton;

import React, { FC, ReactNode, SyntheticEvent } from "react";
import { Center, createStyles, getStylesRef, Tooltip } from "@mantine/core";
import { TablerIcon } from "@tabler/icons";

// TODO: Deprecate this and replace it with Mantine's ActionButton.

type VibinIconButtonProps = {
    icon: TablerIcon;
    size?: number;
    disabled?: boolean;
    container?: boolean;
    fill?: boolean;
    stroke?: number;
    color?: string;
    hoverColor?: string;
    tooltipLabel?: string;
    onClick?: () => void;
};

const VibinIconButton: FC<VibinIconButtonProps> = ({
    icon,
    size = 15,
    disabled = false,
    container = true,
    fill = false,
    stroke = 1,
    color = undefined,
    hoverColor = undefined,
    tooltipLabel = "",
    onClick,
}) => {
    const { classes: dynamicClasses } = createStyles((theme, _params) => ({
        playButtonContainer: {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: "rgb(255, 255, 255, 0.2)",
            transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
            "&:hover": !disabled && {
                cursor: "pointer",
                backgroundColor: theme.colors.blue,
            },
            [`&:hover .${getStylesRef("button")}`]: !disabled && {
                color: theme.colors.gray[1],
                fill: fill ? theme.colors.gray[1] : undefined,
            },
        },
        button: {
            ref: getStylesRef("button"),
            color: color ? color : theme.colors.gray[5],
            fill: fill ? theme.colors.gray[5] : undefined,
            transition: "color .2s ease-in-out, fill .2s ease-in-out",
            "&:hover": !disabled && {
                cursor: "pointer",
                color: hoverColor ? hoverColor : theme.colors.gray[1],
                fill: fill ? theme.colors.gray[1] : undefined,
            },
        },
    }))();

    const clickHandler = (event: SyntheticEvent) => {
        event.stopPropagation();
        onClick && !disabled && onClick();
    };

    // TODO: Is there a way to keep TS happy here.
    // @ts-ignore
    const iconComponent: ReactNode = new icon({
        className: dynamicClasses.button,
        size,
        stroke,
        onClick: container ? undefined : clickHandler,
    });

    return container ? (
        <Tooltip label={tooltipLabel} disabled={!tooltipLabel || disabled}>
            <Center onClick={clickHandler} className={dynamicClasses.playButtonContainer}>
                {iconComponent}
            </Center>
        </Tooltip>
    ) : (
        <Tooltip label={tooltipLabel} disabled={!tooltipLabel || disabled}>
            {iconComponent}
        </Tooltip>
    );
};

export default VibinIconButton;

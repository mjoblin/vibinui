import React, { FC } from "react";
import { Box, Center, createStyles } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

// TODO: This is really just a simple Button. It might benefit from extending <Button> instead.

const useStyles = createStyles((theme) => ({
    playButtonContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgb(255, 255, 255, 0.2)",
        transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
        "&:hover": {
            cursor: "pointer",
            backgroundColor: theme.colors.blue,
        },
    },
    button: {
        color: theme.colors.gray[4],
        fill: theme.colors.gray[4],
        "&:hover": {
            cursor: "pointer",
            color: theme.colors.gray[1],
            fill: theme.colors.gray[1],
        },
    },
}));

type PlayButtonProps = {
    container?: boolean;
    onClick?: () => void;
};

const PlayButton: FC<PlayButtonProps> = ({ container = true, onClick }) => {
    const { classes } = useStyles();

    return container ? (
        <Center
            onClick={(event) => {
                event.stopPropagation();
                onClick && onClick();
            }}
            className={classes.playButtonContainer}
        >
            <IconPlayerPlay size={15} color="white" fill="white" />
        </Center>
    ) : (
        <Box
            onClick={(event) => {
                event.stopPropagation();
                onClick && onClick();
            }}
        >
            <IconPlayerPlay className={classes.button} size={15} />
        </Box>
    );
};

export default PlayButton;

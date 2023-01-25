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
}));

type PlayButtonProps = {
    onClick?: () => void;
};

const PlayButton: FC<PlayButtonProps> = ({ onClick }) => {
    const { classes } = useStyles();

    return (
        <Center
            onClick={(event) => {
                event.stopPropagation();
                onClick && onClick();
            }}
            className={classes.playButtonContainer}
        >
            <IconPlayerPlay size={15} color="white" fill="white" />
        </Center>
    );
};

export default PlayButton;

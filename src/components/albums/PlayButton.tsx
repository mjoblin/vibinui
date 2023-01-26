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
            backgroundColor: theme.colors.blue,
        },
    },
    onHover: {
        "&:hover": {
            cursor: "pointer",
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
            className={`${classes.playButtonContainer} ${classes.onHover}`}
        >
            <IconPlayerPlay size={15} color="white" fill="white" />
        </Center>
    ) : (
        <Box
            onClick={(event) => {
                event.stopPropagation();
                onClick && onClick();
            }}
            className={classes.onHover}
        >
            <IconPlayerPlay size={15} color="white" fill="white" />
        </Box>
    );
};

export default PlayButton;

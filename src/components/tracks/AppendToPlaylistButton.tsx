import React, { FC } from "react";
import { Box, createStyles, Tooltip } from "@mantine/core";
import { IconPlaylistAdd } from "@tabler/icons";

import { MediaId } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
}));

type AppendToPlaylistButtonProps = {
    mediaId: MediaId;
};

const AppendToPlaylistButton: FC<AppendToPlaylistButtonProps> = ({ mediaId }) => {
    const [addMediaToPlaylist] = useAddMediaToPlaylistMutation();
    const { classes } = useStyles();

    return (
        <Box>
            <Tooltip
                label="Append to Playlist"
                color="blue"
                openDelay={500}
                withArrow
                arrowSize={8}
                styles={{ tooltip: { fontSize: 12 } }}
            >
                <Box
                    pt={3}
                    className={classes.pointerOnHover}
                    onClick={() => addMediaToPlaylist({ mediaId: mediaId, action: "APPEND" })}
                >
                    <IconPlaylistAdd size={15} />
                </Box>
            </Tooltip>
        </Box>
    );
};

export default AppendToPlaylistButton;

import React, { FC, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ActionIcon, Box, createStyles, Tooltip, useMantineTheme } from "@mantine/core";
import { IconPlaylistAdd } from "@tabler/icons-react";

import { Album, Track } from "../../../app/types";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinActivePlaylist";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";

// ================================================================================================
// Button to append the given Media (Track or Album) to the current Playlist.
// ================================================================================================

const useStyles = createStyles((theme) => ({
    appendContainer: {
        backgroundColor: "rgb(255, 255, 255, 0.2)",
        color: theme.colors.gray[4],
        transition:
            "transform .2s ease-in-out, background-color .2s ease-in-out, " +
            "transform .2s ease-in-out, color .2s ease-in-out",
        "&:hover": {
            cursor: "pointer",
            backgroundColor: theme.colors.blue,
            color: "white",
        },
    },
}));

type AppendMediaToPlaylistButtonProps = {
    media: Album | Track;
    disabled?: boolean;
    size?: number;
    fill?: boolean;
};

const AppendMediaToPlaylistButton: FC<AppendMediaToPlaylistButtonProps> = ({
    media,
    disabled = false,
    size = 20,
    fill = true,
}) => {
    const theme = useMantineTheme();
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const { classes } = useStyles();

    // TODO: This is effectively a runtime type check. Consider adding user-defined type guards.
    const itemType = (media as any).album === undefined ? "Album" : "Track";

    /**
     * Notify the user whether appending the Track to the Playlist was successful or not.
     */
    useEffect(() => {
        if (addStatus.isSuccess) {
            showSuccessNotification({
                title: `${itemType} appended to Playlist`,
                message: media.title,
            });
        } else if (addStatus.isError) {
            // TODO: Centralize API error handling somewhere.
            const err = addStatus.error as FetchBaseQueryError;
            const status = err.status;
            const issue = err.data || "Unknown error";

            showErrorNotification({
                title: "Error updating Playlist",
                message: `${media.title}: [${status}] ${issue}`,
            });
        }
    }, [media, itemType, addStatus]);

    // --------------------------------------------------------------------------------------------

    return (
        <Box>
            <Tooltip label={`Append ${itemType} to Playlist`}>
                <ActionIcon
                    className={classes.appendContainer}
                    disabled={disabled}
                    loading={addStatus.isLoading}
                    size={size}
                    color={theme.colors.blue[4]}
                    variant="filled"
                    radius={size / 2}
                    onClick={(event) => {
                        event.stopPropagation();
                        addMediaToPlaylist({ mediaId: media.id, action: "APPEND" });
                    }}
                >
                    <IconPlaylistAdd size={size / 1.6} />
                </ActionIcon>
            </Tooltip>
        </Box>
    );
};

export default AppendMediaToPlaylistButton;

import React, { FC, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Box, createStyles, Tooltip } from "@mantine/core";
import { updateNotification } from "@mantine/notifications";
import { IconCheck, IconExclamationMark, IconPlaylistAdd } from "@tabler/icons-react";

import { Album, Track } from "../../../app/types";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinActivePlaylist";
import { showSuccessNotification } from "../../../app/utils";

// ================================================================================================
// Button to append the given Media (Track or Album) to the current Playlist.
// ================================================================================================

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
}));

type AppendAlbumTrackToPlaylistButtonProps = {
    item: Track | Album;
};

const AppendAlbumTrackToPlaylistButton: FC<AppendAlbumTrackToPlaylistButtonProps> = ({ item }) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const { classes } = useStyles();

    const notificationId = `append-to-playlist-${item.id}`;

    // TODO: This is effectively a runtime type check. Consider adding user-defined type guards.
    const itemType = (item as any).album === undefined ? "Album" : "Track";

    /**
     * Notify the user whether appending the Track to the Playlist was successful or not.
     *
     * NOTE: This is an experiment in using Mantine's ability to update an existing notification.
     *  The flow goes from "Updating" (in the onClick() handler in the render), to either
     *  "appended" or an error state (here in the effect).
     */
    useEffect(() => {
        if (addStatus.isSuccess) {
            updateNotification({
                id: notificationId,
                title: `${itemType} appended to Playlist`,
                message: item.title,
                icon: <IconCheck size={16} />,
                color: "teal",
                loading: false,
            });
        } else if (addStatus.isError) {
            // TODO: Centralize API error handling somewhere.
            const err = addStatus.error as FetchBaseQueryError;
            const status = err.status;
            const issue = err.data || "Unknown error";

            updateNotification({
                id: notificationId,
                title: "Error updating Playlist",
                message: `${item.title}: [${status}] ${issue}`,
                icon: <IconExclamationMark size={16} />,
                color: "red",
                loading: false,
                autoClose: false,
            });
        }
    }, [item, itemType, notificationId, addStatus]);

    // --------------------------------------------------------------------------------------------

    return (
        <Box>
            <Tooltip label={`Append ${itemType} to Playlist`}>
                <Box
                    pt={3}
                    className={classes.pointerOnHover}
                    onClick={() => {
                        // TODO: Remove item.id check once Tracks no longer have an optional id
                        item.id && addMediaToPlaylist({ mediaId: item.id, action: "APPEND" });

                        showSuccessNotification({
                            id: notificationId,
                            title: `Appending ${itemType} to Playlist`,
                            message: item.title,
                            icon: undefined,
                            loading: true,
                            autoClose: false,
                        });
                    }}
                >
                    <IconPlaylistAdd size={15} />
                </Box>
            </Tooltip>
        </Box>
    );
};

export default AppendAlbumTrackToPlaylistButton;

import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { IconCheck, IconExclamationMark, IconPlaylistAdd } from "@tabler/icons";

import { Album, Track } from "../../app/types";
import { useAddMediaToPlaylistMutation } from "../../app/services/vibinPlaylist";
import VibinTooltip from "../shared/VibinTooltip";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const useStyles = createStyles((theme) => ({
    pointerOnHover: {
        "&:hover": {
            cursor: "pointer",
        },
    },
}));

type AppendToPlaylistButtonProps = {
    item: Track | Album;
};

const AppendToPlaylistButton: FC<AppendToPlaylistButtonProps> = ({ item }) => {
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const { classes } = useStyles();

    const notificationId = `append-to-playlist-${item.id}`;

    // TODO: This is effectively a runtime type check. Consider adding user-defined type guards.
    const itemType = (item as any).album === undefined ? "Album" : "Track";

    React.useEffect(() => {
        if (addStatus.isSuccess) {
            updateNotification({
                id: notificationId,
                title: `${itemType} appended to Playlist`,
                message: item.title,
                color: "teal",
                icon: <IconCheck size={16} />,
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
                color: "red",
                icon: <IconExclamationMark size={16} />,
                autoClose: false,
            });
        }
    }, [item, itemType, notificationId, addStatus]);

    return (
        <Box>
            <VibinTooltip label={`Append ${itemType} to Playlist`}>
                <Box
                    pt={3}
                    className={classes.pointerOnHover}
                    onClick={() => {
                        // TODO: Remove item.id check once Tracks no longer have an optional id
                        item.id && addMediaToPlaylist({ mediaId: item.id, action: "APPEND" });

                        showNotification({
                            id: notificationId,
                            loading: true,
                            title: `Appending ${itemType} to Playlist`,
                            message: item.title,
                            autoClose: false,
                        });
                    }}
                >
                    <IconPlaylistAdd size={15} />
                </Box>
            </VibinTooltip>
        </Box>
    );
};

export default AppendToPlaylistButton;

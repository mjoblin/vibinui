import React, { FC, useEffect, useState } from "react";
import {
    ActionIcon,
    Center,
    createStyles,
    Dialog,
    Table,
    Text,
    TextInput,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDotsCircleHorizontal, IconTrash } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import {
    useLazyDeleteStoredPlaylistQuery,
    useLazyUpdateStoredPlaylistNameQuery,
} from "../../app/services/vibinStoredPlaylists";
import { RootState } from "../../app/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { epochSecondsToString } from "../../app/utils";

const useStyles = createStyles((theme) => ({
    editorTable: {
        borderCollapse: "collapse",
        thead: {
            fontSize: 13,
            fontWeight: "bold",
            textTransform: "uppercase",
            td: {
                paddingLeft: 10,
            },
        },
    },
}));

const StoredPlaylistsEditor: FC = () => {
    const { classes } = useStyles();
    const { colors } = useMantineTheme();
    const { stored_playlists: storedPlaylists, active_stored_playlist_id: activeStoredPlaylistId } =
        useAppSelector((state: RootState) => state.storedPlaylists);
    const [deleteStoredPlaylist, deleteStoredPlaylistStatus] = useLazyDeleteStoredPlaylistQuery();
    const [updateStoredPlaylistName, updateStoredPlaylistNameStatus] =
        useLazyUpdateStoredPlaylistNameQuery();
    const [showNameNewPlaylistDialog, setShowNameNewPlaylistDialog] = useState<boolean>(false);

    useEffect(() => {
        if (updateStoredPlaylistNameStatus.isSuccess) {
            showNotification({
                title: "Stored Playlist renamed",
                message:
                    storedPlaylists.find(
                        (storedPlaylist) => storedPlaylist.id === activeStoredPlaylistId
                    )?.name || "Unknown name",
            });
        } else if (updateStoredPlaylistNameStatus.isError) {
            const { status, data } = updateStoredPlaylistNameStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error updating Stored Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
                color: "red",
                autoClose: false,
            });
        }
    }, [
        updateStoredPlaylistNameStatus.isSuccess,
        updateStoredPlaylistNameStatus.isError,
        storedPlaylists,
    ]);

    const storedPlaylistRows =
        storedPlaylists && storedPlaylists.length > 0
            ? [...storedPlaylists]
                  .sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0))
                  .map((storedPlaylist) => {
                      return (
                          <tr key={storedPlaylist.id}>
                              <td>
                                  <TextInput
                                      defaultValue={storedPlaylist.name}
                                      onBlur={(event) =>
                                          event.target.value !== storedPlaylist.name &&
                                          updateStoredPlaylistName({
                                              storedPlaylistId: storedPlaylist.id,
                                              name: event.target.value,
                                          })
                                      }
                                  />
                              </td>
                              <td>
                                  <Text color={colors.gray[6]}>
                                      {epochSecondsToString(storedPlaylist.created)}
                                  </Text>
                              </td>
                              <td>
                                  <Text color={colors.gray[6]}>
                                      {epochSecondsToString(storedPlaylist.updated)}
                                  </Text>
                              </td>
                              <td>
                                  <Center>
                                      <Tooltip label={"Delete Stored Playlist"} position="bottom">
                                          <ActionIcon variant="subtle">
                                              <IconTrash
                                                  size={16}
                                                  color={colors.gray[6]}
                                                  onClick={() =>
                                                      deleteStoredPlaylist(storedPlaylist.id)
                                                  }
                                              />
                                          </ActionIcon>
                                      </Tooltip>
                                  </Center>
                              </td>
                          </tr>
                      );
                  })
            : [];

    if (storedPlaylistRows.length <= 0) {
        return <Text weight="bold">No Playlists to display</Text>;
    }

    return (
        <>
            <Table className={classes.editorTable}>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Created</td>
                        <td>Updated</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>{storedPlaylistRows}</tbody>
            </Table>

            <Dialog
                opened={showNameNewPlaylistDialog}
                position={{ top: 100 }}
                onClose={() => setShowNameNewPlaylistDialog(false)}
            >
                <TextInput label="Playlist Name" />
            </Dialog>
        </>
    );
};

export default StoredPlaylistsEditor;

import React, { FC, useEffect } from "react";
import { Center, createStyles, Table, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import {
    useLazyDeleteStoredPlaylistQuery,
    useLazyUpdateStoredPlaylistNameQuery,
} from "../../app/services/vibinStoredPlaylists";
import { RootState } from "../../app/store/store";

const epochSecondsToString = (seconds: number) => new Date(seconds * 1000).toLocaleString();

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
    const { stored_playlists: storedPlaylists } = useAppSelector(
        (state: RootState) => state.storedPlaylists
    );
    const [deleteStoredPlaylist, deleteStoredPlaylistStatus] = useLazyDeleteStoredPlaylistQuery();
    const [updateStoredPlaylistName, updateStoredPlaylistNameStatus] =
        useLazyUpdateStoredPlaylistNameQuery();

    const storedPlaylistRows =
        storedPlaylists && storedPlaylists.length > 0
            ? [...storedPlaylists]
                  .sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0))
                  .map((storedPlaylist) => {
                      return (
                          <tr>
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
                              <td>{epochSecondsToString(storedPlaylist.created)}</td>
                              <td>{epochSecondsToString(storedPlaylist.updated)}</td>
                              <td>
                                  <Center>
                                      <IconTrash
                                          size={16}
                                          onClick={() => deleteStoredPlaylist(storedPlaylist.id)}
                                      />
                                  </Center>
                              </td>
                          </tr>
                      );
                  })
            : [];

    if (storedPlaylistRows.length <= 0) {
        return <Text weight="bold">No Stored Playlists to display</Text>;
    }

    return (
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
    );
};

export default StoredPlaylistsEditor;

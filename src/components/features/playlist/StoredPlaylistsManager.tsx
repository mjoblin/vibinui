import React, { FC, useEffect } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Center,
    createStyles,
    Flex,
    Paper,
    Popover,
    SegmentedControl,
    Stack,
    Table,
    Text,
    TextInput,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import {
    useLazyDeleteStoredPlaylistQuery,
    useLazyUpdateStoredPlaylistNameQuery,
} from "../../../app/services/vibinStoredPlaylists";
import { RootState } from "../../../app/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
    epochSecondsToString,
    showErrorNotification,
    showSuccessNotification,
} from "../../../app/utils";
import {
    PlaylistEditorSortField,
    setPlaylistEditorSortField,
} from "../../../app/store/userSettingsSlice";

// ================================================================================================
// Manage Stored Playlists.
//
// Contains:
//  - List of Stored Playlists.
//      - List can be sorted by various properties.
//      - Stored Playlists can be deleted and renamed.
// ================================================================================================

const useStyles = createStyles((theme) => ({
    editorTable: {
        borderCollapse: "collapse",
        thead: {
            fontSize: 13,
            fontWeight: "bold",
            textTransform: "uppercase",
            td: {
                paddingLeft: 10,
                paddingRight: 10,
            },
        },
        tbody: {
            "td:nth-of-type(2)": {
                textAlign: "right",
            },
        },
    },
}));

const StoredPlaylistsManager: FC = () => {
    const dispatch = useAppDispatch();
    const { classes } = useStyles();
    const { colors } = useMantineTheme();
    const {
        playlists: storedPlaylists,
        status: { active_id: activeStoredPlaylistId },
    } = useAppSelector((state: RootState) => state.storedPlaylists);
    const { sortField: playlistEditorSortField } = useAppSelector(
        (state: RootState) => state.userSettings.playlist.editor,
    );
    const [deleteStoredPlaylist, deleteStoredPlaylistStatus] = useLazyDeleteStoredPlaylistQuery();
    const [updateStoredPlaylistName, updateStoredPlaylistNameStatus] =
        useLazyUpdateStoredPlaylistNameQuery();

    /**
     * Handle Stored Playlist update (e.g. renaming).
     */
    useEffect(() => {
        if (updateStoredPlaylistNameStatus.isLoading || updateStoredPlaylistNameStatus.isFetching) {
            return;
        } else if (updateStoredPlaylistNameStatus.isSuccess) {
            // TODO: Consider adding playlist name here
            showSuccessNotification({ title: "Playlist renamed" });
        } else if (updateStoredPlaylistNameStatus.isError) {
            const { status, data } = updateStoredPlaylistNameStatus.error as FetchBaseQueryError;
            showErrorNotification({
                title: "Error updating Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
    }, [updateStoredPlaylistNameStatus]);

    /**
     * Handle Stored Playlist deletion.
     */
    useEffect(() => {
        if (deleteStoredPlaylistStatus.isLoading || deleteStoredPlaylistStatus.isFetching) {
            return;
        } else if (deleteStoredPlaylistStatus.isSuccess) {
            // TODO: Consider adding playlist name here
            showSuccessNotification({ title: "Playlist deleted" });
        } else if (deleteStoredPlaylistStatus.isError) {
            const { status, data } = deleteStoredPlaylistStatus.error as FetchBaseQueryError;
            showErrorNotification({
                title: "Error deleting Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
    }, [deleteStoredPlaylistStatus]);

    // --------------------------------------------------------------------------------------------

    // Create a table row for each Stored Playlist.
    const storedPlaylistRows =
        storedPlaylists && storedPlaylists.length > 0
            ? [...storedPlaylists]
                  .sort((a, b) => {
                      if (playlistEditorSortField === "entry_count") {
                          return b.entry_ids.length - a.entry_ids.length;
                      }

                      const aValue = a[playlistEditorSortField];
                      const bValue = b[playlistEditorSortField];

                      const result = aValue < bValue ? 1 : aValue > bValue ? -1 : 0;

                      if (playlistEditorSortField === "name") {
                          return result * -1;
                      }

                      return result;
                  })
                  .map((storedPlaylist) => {
                      return (
                          <tr key={storedPlaylist.id}>
                              <td>
                                  <TextInput
                                      defaultValue={storedPlaylist.name}
                                      onBlur={(event) =>
                                          event.target.value !== storedPlaylist.name &&
                                          !storedPlaylists
                                              .map((playlist) => playlist.name)
                                              .includes(event.target.value) &&
                                          updateStoredPlaylistName({
                                              storedPlaylistId: storedPlaylist.id,
                                              name: event.target.value,
                                          })
                                      }
                                  />
                              </td>
                              <td>
                                  <Text color={colors.gray[6]}>
                                      {storedPlaylist.entry_ids.length}
                                  </Text>
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
                                  {/* Delete Playlist */}
                                  <Center>
                                      <Tooltip
                                          disabled={storedPlaylist.id !== activeStoredPlaylistId}
                                          label={
                                              storedPlaylist.id === activeStoredPlaylistId
                                                  ? "Cannot delete active playlist"
                                                  : ""
                                          }
                                          arrowPosition="center"
                                          withinPortal={true}
                                      >
                                          <Box>
                                              <Popover
                                                  position="bottom"
                                                  withArrow
                                                  arrowPosition="center"
                                                  disabled={
                                                      storedPlaylist.id === activeStoredPlaylistId
                                                  }
                                              >
                                                  <Popover.Target>
                                                      <ActionIcon
                                                          variant="subtle"
                                                          disabled={
                                                              storedPlaylist.id ===
                                                              activeStoredPlaylistId
                                                          }
                                                      >
                                                          <IconTrash
                                                              size={16}
                                                              color={colors.gray[6]}
                                                          />
                                                      </ActionIcon>
                                                  </Popover.Target>
                                                  <Popover.Dropdown>
                                                      <Stack align="center">
                                                          <Flex gap={5}>
                                                              <Text>Delete Playlist</Text>
                                                              <Text weight="bold">
                                                                  {storedPlaylist.name}
                                                              </Text>
                                                              <Text>?</Text>
                                                          </Flex>

                                                          <Button
                                                              size="xs"
                                                              maw="6rem"
                                                              onClick={() =>
                                                                  deleteStoredPlaylist(
                                                                      storedPlaylist.id,
                                                                  )
                                                              }
                                                          >
                                                              Delete
                                                          </Button>
                                                      </Stack>
                                                  </Popover.Dropdown>
                                              </Popover>
                                          </Box>
                                      </Tooltip>
                                  </Center>
                              </td>
                          </tr>
                      );
                  })
            : [];

    // Return instructions if no Stored Playlists exist.
    if (storedPlaylistRows.length <= 0) {
        return (
            <Paper withBorder p={20}>
                <Center>
                    <Stack>
                        <Text size={14} transform="uppercase">
                            No Playlists to display
                        </Text>
                        <Text size={14} color={colors.gray[6]}>
                            To create a Playlist, choose "Save Playlist as New..." from the menu.
                        </Text>
                    </Stack>
                </Center>
            </Paper>
        );
    }

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing="md">
            <Flex gap="xs" align="center">
                <Text size="sm">Sort field:</Text>
                <SegmentedControl
                    value={playlistEditorSortField}
                    size="xs"
                    color="blue"
                    radius={5}
                    onChange={(value) =>
                        value &&
                        dispatch(setPlaylistEditorSortField(value as PlaylistEditorSortField))
                    }
                    data={[
                        {
                            value: "name",
                            label: <Text>Name</Text>,
                        },
                        {
                            value: "entry_count",
                            label: <Text>Entries</Text>,
                        },
                        {
                            value: "created",
                            label: <Text>Created</Text>,
                        },
                        {
                            value: "updated",
                            label: <Text>Updated</Text>,
                        },
                    ]}
                />
            </Flex>

            <Table className={classes.editorTable}>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Entries</td>
                        <td>Created</td>
                        <td>Updated</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>{storedPlaylistRows}</tbody>
            </Table>
        </Stack>
    );
};

export default StoredPlaylistsManager;

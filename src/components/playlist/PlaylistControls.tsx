import React, { FC, forwardRef, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
    ActionIcon,
    Box,
    Button,
    Center,
    Flex,
    Group,
    Indicator,
    Loader,
    Menu,
    Modal,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import {
    IconDotsCircleHorizontal,
    IconFile,
    IconFilePlus,
    IconListDetails,
    IconMenu2,
} from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PlaylistViewMode, setPlaylistViewMode } from "../../app/store/userSettingsSlice";
import {
    useLazyActivateStoredPlaylistQuery,
    useLazyStoreCurrentPlaylistQuery,
} from "../../app/services/vibinStoredPlaylists";
import { RootState } from "../../app/store/store";
import StoredPlaylistsEditor from "./StoredPlaylistsEditor";
import GlowTitle from "../shared/GlowTitle";
import { epochSecondsToStringRelative } from "../../app/utils";

type PlaylistSelectItemProps = {
    label: string;
    entryCount: number;
    updated: number;
};

/**
 *
 */
const PlaylistSelectItem = forwardRef<HTMLDivElement, PlaylistSelectItemProps>(
    ({ label, entryCount, updated, ...others }: PlaylistSelectItemProps, ref) => {
        const { colors } = useMantineTheme();

        return (
            <Box px={8} py={5} ref={ref} {...others}>
                <Group noWrap>
                    <Stack spacing={0} w="100%">
                        <Text size="sm">{label}</Text>
                        {/* @ts-ignore */}
                        <Text color={others["data-selected"] ? colors.gray[5] : colors.gray[6]} size="xs">
                            {`${entryCount} entries, updated ${epochSecondsToStringRelative(
                                updated
                            )}`}
                        </Text>
                    </Stack>
                </Group>
            </Box>
        );
    }
);

const PlaylistControls: FC = () => {
    const { colors } = useMantineTheme();
    const dispatch = useAppDispatch();
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);
    const {
        active_stored_playlist_id: activeStoredPlaylistId,
        active_synced_with_store: activeSyncedWithStore,
        activating_stored_playlist: activatingStoredPlaylist,
        stored_playlists: storedPlaylists,
    } = useAppSelector((state: RootState) => state.storedPlaylists);
    const [activeStoredPlaylistName, setActiveStoredPlaylistName] = useState<string | undefined>();
    const [activateStoredPlaylistId, activatePlaylistStatus] = useLazyActivateStoredPlaylistQuery();
    const [storePlaylist, storePlaylistStatus] = useLazyStoreCurrentPlaylistQuery();
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [showNameNewPlaylistDialog, setShowNameNewPlaylistDialog] = useState<boolean>(false);
    const [newFormName, setNewFormName] = useState<string>("");

    const newPlaylistForm = useForm({
        initialValues: {
            name: "",
        },
        validate: {
            name: isNotEmpty(),
        },
    });
    
    useEffect(() => {
        setActiveStoredPlaylistName(
            storedPlaylists.find((playlist) => playlist.id === activeStoredPlaylistId)?.name
        );
    }, [activeStoredPlaylistId, storedPlaylists]);

    /**
     *
     */
    useEffect(() => {
        if (activatePlaylistStatus.isSuccess) {
            showNotification({
                title: "Playlist activated",
                message:
                    storedPlaylists.find(
                        (storedPlaylist) => storedPlaylist.id === activeStoredPlaylistId
                    )?.name || "Unknown name",
            });
        } else if (activatePlaylistStatus.isError) {
            const { status, data } = activatePlaylistStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error switching to Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
                color: "red",
                autoClose: false,
            });
        }
    }, [activatePlaylistStatus.isSuccess, activatePlaylistStatus.isError]);

    /**
     *
     */
    useEffect(() => {
        const replacing = !!storePlaylistStatus.originalArgs?.replace;

        if (storePlaylistStatus.isSuccess) {
            showNotification({
                title: replacing ? "Playlist saved" : "New Playlist created",
                message: replacing ? activeStoredPlaylistName : newFormName || "Unknown name",
            });
        } else if (storePlaylistStatus.isError) {
            const { status, data } = activatePlaylistStatus.error as FetchBaseQueryError;

            showNotification({
                title: `Error ${replacing ? "saving" : "creating new"} Playlist`,
                message: `[${status}] ${JSON.stringify(data)}`,
                color: "red",
                autoClose: false,
            });
        }
    }, [storePlaylistStatus.isSuccess, storePlaylistStatus.isError, newFormName]);

    // --------------------------------------------------------------------------------------------

    const playlistDetails: { value: string; label: string }[] =
        storedPlaylists && storedPlaylists.length > 0
            ? [...storedPlaylists]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((storedPlaylist) => {
                      return {
                          value: storedPlaylist.id || "",
                          label: storedPlaylist.name || "unknown",
                          entryCount: storedPlaylist.entry_ids.length,
                          updated: storedPlaylist.updated,
                      };
                  })
            : [];

    // --------------------------------------------------------------------------------------------

    return (
        <Flex gap={25} pt={7} align="center">
            <GlowTitle>Playlists</GlowTitle>

            <Flex gap={5} w={275} align="center">
                {activatingStoredPlaylist && (
                    <Flex gap={10} align="center">
                        <Loader size="sm" />
                        <Text size="xs" weight="bold">
                            Activating...
                        </Text>
                    </Flex>
                )}

                {!activatingStoredPlaylist && (
                    <>
                        {/* Playlist names (selecting a Playlist name will activate it) */}
                        <Indicator
                            size={7}
                            disabled={!activeStoredPlaylistId || activeSyncedWithStore}
                        >
                            <Select
                                placeholder="Select a Playlist"
                                itemComponent={PlaylistSelectItem}
                                withinPortal={true}
                                data={playlistDetails}
                                limit={10}
                                value={activeStoredPlaylistId}
                                w={250}
                                maxDropdownHeight={700}
                                onChange={(value) => value && activateStoredPlaylistId(value)}
                            />
                        </Indicator>

                        {/* Playlist save options */}
                        <Menu shadow="md" position="bottom-start">
                            <Menu.Target>
                                <ActionIcon variant="transparent">
                                    <IconDotsCircleHorizontal size={20} color={colors.gray[6]} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Save</Menu.Label>
                                <Menu.Item
                                    disabled={!activeStoredPlaylistId || activeSyncedWithStore}
                                    icon={
                                        <Indicator
                                            size={7}
                                            disabled={
                                                !activeStoredPlaylistId || activeSyncedWithStore
                                            }
                                        >
                                            <IconFile size={14} />
                                        </Indicator>
                                    }
                                    onClick={() => storePlaylist({ replace: true })}
                                >
                                    Save Playlist
                                </Menu.Item>
                                <Menu.Item
                                    icon={<IconFilePlus size={14} />}
                                    onClick={() => setShowNameNewPlaylistDialog(true)}
                                >
                                    Save Playlist as New...
                                </Menu.Item>

                                <Menu.Label>Management</Menu.Label>
                                <Menu.Item
                                    icon={<IconListDetails size={14} />}
                                    onClick={() => setShowEditor(true)}
                                >
                                    Playlists Manager...
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </>
                )}
            </Flex>

            {/* Playlist display options (simple vs. detailed) */}
            <SegmentedControl
                value={viewMode}
                radius={5}
                onChange={(value) =>
                    value && dispatch(setPlaylistViewMode(value as PlaylistViewMode))
                }
                data={[
                    {
                        value: "simple",
                        label: (
                            <Center>
                                <IconMenu2 size={14} />
                                <Text size={14} ml={10}>
                                    Simple
                                </Text>
                            </Center>
                        ),
                    },
                    {
                        value: "detailed",
                        label: (
                            <Center>
                                <IconListDetails size={14} />
                                <Text size={14} ml={10}>
                                    Detailed
                                </Text>
                            </Center>
                        ),
                    },
                ]}
            />

            {/* Stored Playlist editor modal (change playlist names, delete playlists, etc) */}
            <Modal
                opened={showEditor}
                centered={true}
                size="auto"
                title="Playlists Manager"
                onClose={() => setShowEditor(false)}
            >
                <StoredPlaylistsEditor />
            </Modal>

            {/* Request name for new Stored Playlist */}
            <Modal
                opened={showNameNewPlaylistDialog}
                centered={true}
                size="auto"
                title="Create new Playlist"
                onClose={() => setShowNameNewPlaylistDialog(false)}
            >
                <Box
                    component="form"
                    onSubmit={newPlaylistForm.onSubmit((formValues) => {
                        setNewFormName(formValues.name);
                        storePlaylist({ name: formValues.name, replace: false });
                        setShowNameNewPlaylistDialog(false);
                    })}
                >
                    <Flex gap="md" align="flex-end">
                        <TextInput
                            label="Playlist name"
                            placeholder="Enter Playlist name"
                            {...newPlaylistForm.getInputProps("name")}
                        />
                        <Button type="submit">Save</Button>
                    </Flex>
                </Box>
            </Modal>
        </Flex>
    );
};

export default PlaylistControls;

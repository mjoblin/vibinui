import React, { FC, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
    ActionIcon,
    Center,
    Flex,
    Indicator,
    Menu,
    Modal,
    SegmentedControl,
    Select,
    Text,
    Tooltip,
} from "@mantine/core";
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

const PlaylistControls: FC = () => {
    const dispatch = useAppDispatch();
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);
    const {
        active_stored_playlist_id: activeStoredPlaylistId,
        active_synced_with_store: activeSyncedWithStore,
        stored_playlists: storedPlaylists,
    } = useAppSelector((state: RootState) => state.storedPlaylists);
    const [activateStoredPlaylistId, activatePlaylistStatus] = useLazyActivateStoredPlaylistQuery();
    const [storePlaylist, storePlaylistStatus] = useLazyStoreCurrentPlaylistQuery();
    const [showEditor, setShowEditor] = useState<boolean>(false);

    useEffect(() => {
        if (activatePlaylistStatus.isSuccess) {
            showNotification({
                title: "Stored Playlist activated",
                message:
                    storedPlaylists.find(
                        (storedPlaylist) => storedPlaylist.id === activeStoredPlaylistId
                    )?.name || "Unknown name",
            });
        } else if (activatePlaylistStatus.isError) {
            const { status, data } = activatePlaylistStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Error switching to Stored Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
                color: "red",
                autoClose: false,
            });
        }
    }, [activatePlaylistStatus]);

    const playlistDetails: { value: string; label: string }[] =
        storedPlaylists && storedPlaylists.length > 0
            ? storedPlaylists.map((storedPlaylist) => {
                  return {
                      value: storedPlaylist.id || "",
                      label: storedPlaylist.name || "unknown",
                  };
              })
            : [];

    return (
        <Flex gap={25} align="center">
            <Flex gap={5} align="center">
                {/* Playlist names (selectable) */}
                <Select
                    placeholder="Select a Playlist"
                    data={playlistDetails}
                    limit={10}
                    value={activeStoredPlaylistId}
                    onChange={(value) => value && activateStoredPlaylistId(value)}
                />

                {/* Playlist save options */}
                <Indicator size={7} disabled={activeSyncedWithStore}>
                    <Menu shadow="md" position="bottom-start">
                        <Menu.Target>
                            <ActionIcon variant="transparent">
                                <IconDotsCircleHorizontal size={20} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                icon={<IconFile size={14} />}
                                onClick={() => storePlaylist({ replace: true })}
                            >
                                Save Playlist
                            </Menu.Item>
                            <Menu.Item
                                icon={<IconFilePlus size={14} />}
                                onClick={() => storePlaylist({ replace: false })}
                            >
                                Save Playlist as New...
                            </Menu.Item>
                            <Menu.Item
                                icon={<IconListDetails size={14} />}
                                onClick={() => setShowEditor(true)}
                            >
                                Playlists Manager...
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Indicator>
            </Flex>

            {/* Playlist display options */}
            <SegmentedControl
                value={viewMode}
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

            {showEditor && (
                <Modal
                    opened={showEditor}
                    centered={true}
                    size="auto"
                    title="Playlists Manager"
                    onClose={() => setShowEditor(false)}
                >
                    <StoredPlaylistsEditor />
                </Modal>
            )}
        </Flex>
    );
};

export default PlaylistControls;

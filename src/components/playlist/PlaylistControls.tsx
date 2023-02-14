import React, { FC } from "react";
import {
    ActionIcon,
    Center,
    Flex,
    Indicator,
    Menu,
    SegmentedControl,
    Select,
    Text,
    Tooltip,
} from "@mantine/core";
import { IconFile, IconFilePlus, IconListDetails, IconMenu2 } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PlaylistViewMode, setPlaylistViewMode } from "../../app/store/userSettingsSlice";
import { useGetStoredPlaylistsQuery } from "../../app/services/vibinPlaylists";
import { RootState } from "../../app/store/store";

const PlaylistControls: FC = () => {
    const dispatch = useAppDispatch();
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);
    const { data: storedPlaylists } = useGetStoredPlaylistsQuery();
    
    const playlistDetails: { value: string; label: string }[] =
        storedPlaylists && storedPlaylists.length > 0
            ? storedPlaylists.map((storedPlaylist) => {
                  return {
                      value: storedPlaylist.name || "unknown",
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
                />

                {/* Playlist save options */}
                <Indicator size={7} disabled={false}>
                    <Menu shadow="md" width={200} position="bottom-start">
                        <Menu.Target>
                            <Tooltip label="Save Playlist" position="bottom">
                                <ActionIcon color="blue" variant="subtle">
                                    <IconFile size={18} />
                                </ActionIcon>
                            </Tooltip>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item icon={<IconFile size={14} />}>Save Playlist</Menu.Item>
                            <Menu.Item icon={<IconFilePlus size={14} />}>Save as New...</Menu.Item>
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
        </Flex>
    );
};

export default PlaylistControls;

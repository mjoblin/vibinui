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
    RingProgress,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconDotsCircleHorizontal,
    IconExclamationMark,
    IconFile,
    IconFilePlus,
    IconListDetails,
    IconMenu2,
} from "@tabler/icons";

import { RootState } from "../../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import {
    PlaylistViewMode,
    setPlaylistFollowCurrentlyPlaying,
    setPlaylistViewMode,
} from "../../../app/store/userSettingsSlice";
import { setHaveReceivedInitialState } from "../../../app/store/playlistSlice";
import {
    useLazyActivateStoredPlaylistQuery,
    useLazyStoreCurrentPlaylistQuery,
} from "../../../app/services/vibinStoredPlaylists";
import { useLazyPowerToggleQuery } from "../../../app/services/vibinSystem";
import StoredPlaylistsManager from "./StoredPlaylistsManager";
import CurrentlyPlayingButton from "../../shared/buttons/CurrentlyPlayingButton";
import {
    epochSecondsToStringRelative,
    hmsToSecs,
    playlistDuration,
    secstoHms,
    showErrorNotification,
    showSuccessNotification,
} from "../../../app/utils";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import FollowCurrentlyPlayingToggle from "../../shared/buttons/FollowCurrentlyPlayingToggle";

// ================================================================================================
// Controls for the <Playlist>.
// ================================================================================================

const PlaylistDuration: FC = () => {
    const { colors } = useMantineTheme();
    const [activePlaylistDuration, setActivePlaylistDuration] = useState<number>(0);
    const [completedEntriesProgress, setCompletedEntriesProgress] = useState<number>(0);
    const [totalProgress, setTotalProgress] = useState<number>(0);
    const { current_track_index, entries: activePlaylistEntries } = useAppSelector(
        (state: RootState) => state.playlist
    );
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const playheadPosition = useAppSelector((state: RootState) => state.playback.playhead.position);
    const playheadPositionNormalized = useAppSelector(
        (state: RootState) => state.playback.playhead.position_normalized
    );

    useEffect(() => {
        if (!activePlaylistEntries || activePlaylistEntries.length <= 0) {
            setActivePlaylistDuration(0);
            return;
        }

        setActivePlaylistDuration(playlistDuration(activePlaylistEntries));
    }, [activePlaylistEntries]);

    useEffect(() => {
        if (!current_track_index || !activePlaylistEntries || activePlaylistEntries.length <= 0) {
            setCompletedEntriesProgress(0);
            return;
        }

        const progress = activePlaylistEntries
            .filter((entry) => entry.index < current_track_index)
            .reduce((totalDuration, entry) => totalDuration + hmsToSecs(entry.duration), 0);

        setCompletedEntriesProgress(progress);
    }, [activePlaylistEntries, current_track_index, playStatus]);
    
    useEffect(() => {
        // The check for buffering and playheadPositionNormalized is to reduce the chances that
        // the totalProgress will (briefly) add the progress of the *next* playlist entry to the
        // *end time* of the previous track. This results in the totalProgress skipping ahead by
        // a full track duration before being reset back to where it should be.
        playStatus !== "buffering" &&
            playheadPositionNormalized < 0.95 &&
            setTotalProgress(completedEntriesProgress + playheadPosition);
    }, [completedEntriesProgress, playheadPosition, playheadPositionNormalized, playStatus]);

    const completed = (totalProgress / activePlaylistDuration) * 100;

    return (
        <Flex align="center" pl={10}>
            <Text size="xs" pr={5} color={colors.dark[2]}>
                duration:
            </Text>
            <Text size="xs" pr={10} color={colors.dark[2]} weight="bold">{`${secstoHms(
                activePlaylistDuration
            )}s`}</Text>

            {!isNaN(completed) && (
                <>
                    <RingProgress size={40} sections={[{ value: completed, color: "blue" }]} />
                    <Text size="xs" color={colors.blue[5]} weight="bold" miw="1.80rem">{`${completed.toFixed(
                        0
                    )}%`}</Text>
                </>
            )}
        </Flex>
    );
};

// ------------------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------------------

type PlaylistControlsProps = {
    scrollToCurrent?: (options?: { offset?: number }) => void;
}

const PlaylistControls: FC<PlaylistControlsProps> = ({ scrollToCurrent }) => {
    const { APP_MODAL_BLUR, RENDER_APP_BACKGROUND_IMAGE } = useAppGlobals();
    const { colors } = useMantineTheme();
    const dispatch = useAppDispatch();
    const { followCurrentlyPlaying, viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);
    const {
        active_stored_playlist_id: activeStoredPlaylistId,
        active_synced_with_store: activeSyncedWithStore,
        activating_stored_playlist: activatingStoredPlaylist,
        stored_playlists: storedPlaylists,
    } = useAppSelector((state: RootState) => state.storedPlaylists);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const { current_track_index } = useAppSelector((state: RootState) => state.playlist);
    const [togglePower] = useLazyPowerToggleQuery();
    const [activeStoredPlaylistName, setActiveStoredPlaylistName] = useState<string | undefined>();
    const [activateStoredPlaylistId, activatePlaylistStatus] = useLazyActivateStoredPlaylistQuery();
    const [storePlaylist, storePlaylistStatus] = useLazyStoreCurrentPlaylistQuery();
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [showNameNewPlaylistDialog, setShowNameNewPlaylistDialog] = useState<boolean>(false);
    const [newPlaylistName, setNewPlaylistName] = useState<string>("");

    const newPlaylistForm = useForm({
        initialValues: {
            name: "",
        },
        validate: {
            // Returns true on error, to prevent awkward element repositioning when the error is
            // displayed. This comes at the expense of the error state not being explained to the
            // user.
            name: (value) =>
                /^\s*$/.test(value) ||
                storedPlaylists.map((playlist) => playlist.name).includes(value)
                    ? true
                    : null,
        },
        validateInputOnChange: true,
    });

    /**
     * Auto-scroll to the current entry when the current entry changes, and if the "follow" feature
     * is enabled. The goal is to keep the current entry near the top of the playlist while the
     * playlist screen remains open.
     */
    useEffect(() => {
        followCurrentlyPlaying &&
            current_track_index !== undefined &&
            scrollToCurrent &&
            scrollToCurrent({ offset: 45 }); // Offset results in previous track still being visible
    }, [followCurrentlyPlaying, current_track_index, scrollToCurrent]);

    useEffect(() => {
        if (!activeStoredPlaylistId) {
            return;
        }
        
        const thisPlaylistName =
            storedPlaylists.find((storedPlaylist) => storedPlaylist.id === activeStoredPlaylistId)
                ?.name || "Unknown name";
        
        setActiveStoredPlaylistName(thisPlaylistName);
    }, [activeStoredPlaylistId, storedPlaylists]);

    /**
     * Handle an attempt to activate a playlist (successful or unsuccessful).
     */
    useEffect(() => {
        if (activatePlaylistStatus.isError) {
            const { status, data } = activatePlaylistStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Error activating Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
        else if (activatePlaylistStatus.isSuccess) {
            showSuccessNotification({
                title: "Playlist activated",
                message: activeStoredPlaylistName,
            });
        }
    }, [
        activatePlaylistStatus.isSuccess,
        activatePlaylistStatus.isError,
        activatePlaylistStatus.error,
        activeStoredPlaylistName,
    ]);
    
    /**
     *
     */
    useEffect(() => {
        const replacing = !!storePlaylistStatus.originalArgs?.replace;

        if (storePlaylistStatus.isSuccess) {
            if (replacing) {
                showSuccessNotification({
                    title: "Playlist saved",
                });
            } else {
                showSuccessNotification({
                    title: "New Playlist created",
                    message: newPlaylistName,
                });
            }
        } else if (storePlaylistStatus.isError) {
            const { status, data } = storePlaylistStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: `Error ${replacing ? "saving" : "creating new"} Playlist`,
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
    }, [
        storePlaylistStatus.isSuccess,
        storePlaylistStatus.isError,
        storePlaylistStatus.error,
        storePlaylistStatus.originalArgs,
        newPlaylistName,
    ]);

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

    const isStreamerOff = streamerPower === "off";
    const isPlaylistPersisted = !!activeStoredPlaylistId;

    /**
     * Activate the given playlist id.
     *
     * setHaveReceivedInitialState(false) is dispatched here to put the playlist state into
     * "waiting for playlist from the back-end" mode. This will in turn result in the playlist
     * display going into its "loading..." phase (like it does when the app is first loaded). Once
     * the new playlist details are received from the back-end over the websocket,
     * haveReceivedIntialState will be set back to true by the websocket message handler.
     */
    const activatePlaylist = (id: string) => {
        dispatch(setHaveReceivedInitialState(false));
        activateStoredPlaylistId(id);
    };

    return (
        <Flex h="100%" align="center" justify="space-between">
            <Flex gap={25} align="center">
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
                            <Select
                                placeholder="Select a Playlist"
                                itemComponent={PlaylistSelectItem}
                                withinPortal={true}
                                data={playlistDetails}
                                limit={10}
                                value={activeStoredPlaylistId}
                                w={250}
                                maxDropdownHeight={700}
                                onChange={(value) => {
                                    if (!value) {
                                        return;
                                    }

                                    if (isStreamerOff) {
                                        togglePower().then(() => {
                                            activatePlaylist(value);
                                        });
                                    } else {
                                        activatePlaylist(value);
                                    }
                                }}
                            />

                            {/* Playlist save options */}
                            <Indicator
                                size={7}
                                disabled={isPlaylistPersisted && activeSyncedWithStore}
                                position="top-start"
                                offset={3}
                            >
                                <Menu
                                    shadow="md"
                                    position="bottom-start"
                                    withArrow
                                    arrowPosition="center"
                                >
                                    <Menu.Target>
                                        <ActionIcon variant="transparent">
                                            <IconDotsCircleHorizontal
                                                size={20}
                                                color={colors.gray[6]}
                                            />
                                        </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Menu.Label>Save</Menu.Label>
                                        <Menu.Item
                                            disabled={
                                                !activeStoredPlaylistId || activeSyncedWithStore
                                            }
                                            icon={
                                                <Indicator
                                                    size={7}
                                                    disabled={
                                                        !isPlaylistPersisted ||
                                                        (isPlaylistPersisted &&
                                                            activeSyncedWithStore)
                                                    }
                                                    position="top-start"
                                                    offset={-4}
                                                >
                                                    <IconFile size={14} />
                                                </Indicator>
                                            }
                                            onClick={() => storePlaylist({ replace: true })}
                                        >
                                            Save Playlist
                                        </Menu.Item>
                                        <Menu.Item
                                            icon={
                                                <Indicator
                                                    size={7}
                                                    disabled={isPlaylistPersisted}
                                                    position="top-start"
                                                    offset={-4}
                                                >
                                                    <IconFilePlus size={14} />
                                                </Indicator>
                                            }
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
                            </Indicator>
                        </>
                    )}
                </Flex>

                {/* Playlist display options (simple vs. detailed) */}
                <SegmentedControl
                    value={viewMode}
                    radius={5}
                    styles={{
                        root: {
                            backgroundColor: RENDER_APP_BACKGROUND_IMAGE
                                ? "rgb(0, 0, 0, 0)"
                                : undefined,
                        },
                    }}
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

                <PlaylistDuration />

                <Flex gap={5} align="center">
                    <CurrentlyPlayingButton
                        tooltipLabel="Show currently playing Entry"
                        onClick={scrollToCurrent}
                    />

                    <FollowCurrentlyPlayingToggle
                        isOn={followCurrentlyPlaying}
                        tooltipLabel="Follow currently playing Entry"
                        onClick={() =>
                            dispatch(setPlaylistFollowCurrentlyPlaying(!followCurrentlyPlaying))
                        }
                    />
                </Flex>
            </Flex>

            {/* Inform the user if the current persisted playlist has changed */}
            {isPlaylistPersisted && !activeSyncedWithStore && (
                <Tooltip label="Playlist has unsaved changes" position="bottom">
                    <ThemeIcon color={colors.yellow[4]} size={20} radius={10}>
                        <IconExclamationMark size={17} stroke={2} color={colors.dark[7]} />
                    </ThemeIcon>
                </Tooltip>
            )}

            {/* Modals ------------------------------------------------------------------------ */}

            {/* Stored Playlist editor modal (change playlist names, delete playlists, etc) */}
            <Modal
                opened={showEditor}
                centered={true}
                size="auto"
                overlayProps={{ blur: APP_MODAL_BLUR }}
                title="Playlists Manager"
                onClose={() => setShowEditor(false)}
            >
                <StoredPlaylistsManager />
            </Modal>

            {/* Request name for new Stored Playlist */}
            <Modal
                opened={showNameNewPlaylistDialog}
                centered={true}
                size="auto"
                overlayProps={{ blur: APP_MODAL_BLUR }}
                title="Create new Playlist"
                onClose={() => setShowNameNewPlaylistDialog(false)}
            >
                <Box
                    component="form"
                    onSubmit={newPlaylistForm.onSubmit((formValues) => {
                        setNewPlaylistName(formValues.name);
                        storePlaylist({ name: formValues.name, replace: false });
                        setShowNameNewPlaylistDialog(false);
                        formValues.name = "";
                    })}
                >
                    <Flex gap="md" align="flex-end">
                        <TextInput
                            label="Playlist name"
                            placeholder="Enter Playlist name"
                            {...newPlaylistForm.getInputProps("name")}
                        />
                        <Button type="submit" maw="6rem">
                            Save
                        </Button>
                    </Flex>
                </Box>
            </Modal>
        </Flex>
    );
};

export default PlaylistControls;

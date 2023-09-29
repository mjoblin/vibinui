import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Center,
    Checkbox,
    Flex,
    NumberInput,
    Paper,
    Stack,
    Table,
    Text,
    TextInput,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconMoodSmile, IconRefresh } from "@tabler/icons-react";

import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { RootState } from "../../app/store/store";
import {
    useLazyClearMediaCachesQuery,
    useLazySettingsQuery,
    useLazyUpdateSettingsQuery,
    VibinSettings,
} from "../../app/services/vibinVibin";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../app/services/vibinAlbums";
import { useGetArtistsQuery } from "../../app/services/vibinArtists";
import { useGetTracksQuery } from "../../app/services/vibinTracks";
import { showErrorNotification, showSuccessNotification } from "../../app/utils";
import {
    setApplicationAmplifierMaxVolume,
    setApplicationAutoPlayOnPlaylistActivation,
    setApplicationUseImageBackground,
} from "../../app/store/userSettingsSlice";
import { useAmplifierVolumeSetMutation } from "../../app/services/vibinSystem";
import StylizedLabel from "../shared/textDisplay/StylizedLabel";
import FieldValueList from "../shared/dataDisplay/FieldValueList";
import BackgroundComputeIndicator from "../shared/dataDisplay/BackgroundComputeIndicator";
import WaitingOnAPIIndicator from "../shared/dataDisplay/WaitingOnAPIIndicator";
import WebsocketIndicator from "../shared/dataDisplay/WebsocketIndicator";
import PlayStateIndicator from "../shared/dataDisplay/PlayStateIndicator";
import MediaSourceBadge from "../shared/dataDisplay/MediaSourceBadge";
import SelfUpdatingRelativeDate from "../shared/dataDisplay/SelfUpdatingRelativeDate";

// ================================================================================================
// Status screen.
//
// TODO: Consider renaming as this also includes user settings (or move user settings elsewhere in
//  the application).
//
// Contents:
//  - User settings
//  - Web application status
//  - Device information
//  - Media paths
//  - Server (backend) status
// ================================================================================================

const StatusScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const [clearMediaCache] = useLazyClearMediaCachesQuery();
    const { refetch: refetchAlbums } = useGetAlbumsQuery();
    const { refetch: refetchNewAlbums } = useGetNewAlbumsQuery();
    const { refetch: refetchArtists } = useGetArtistsQuery();
    const { refetch: refetchTracks } = useGetTracksQuery();
    const { streamer, media_server: mediaServer, amplifier } = useAppSelector(
        (state: RootState) => state.system
    );
    const { websocketClientId, websocketStatus } = useAppSelector(
        (state: RootState) => state.internal.application
    );
    const {
        vibin_version: vibinVersion,
        start_time: startTime,
        system_node: systemNode,
        system_platform: systemPlatform,
        clients,
    } = useAppSelector((state: RootState) => state.vibinStatus);
    const { amplifierMaxVolume, autoPlayOnPlaylistActivation, useImageBackground } = useAppSelector(
        (state: RootState) => state.userSettings.application
    );
    const [getSettings, getSettingsResult] = useLazySettingsQuery();
    const [updateSettings, updateSettingsResult] = useLazyUpdateSettingsQuery();
    const [volumeSet] = useAmplifierVolumeSetMutation();
    const [allAlbumsPath, setAllAlbumsPath] = useState<string>()
    const [newAlbumsPath, setNewAlbumsPath] = useState<string>()
    const [allArtistsPath, setAllArtistsPath] = useState<string>();
    const [normalizedMaxVolume, setNormalizedMaxVolume] = useState<number>(0.0);
    const maxVolumeInputRef = useRef<HTMLInputElement>(null);

    /**
     * Retrieve the current settings when the component mounts.
     */
    useEffect(() => {
        getSettings();
    }, [getSettings]);

    /**
     * When the current settings are received, set their values in component state to drive the
     * input field values.
     */
    useEffect(() => {
        if (getSettingsResult.isFetching) {
            return;
        } else if (getSettingsResult.isSuccess) {
            setAllAlbumsPath(getSettingsResult.data.all_albums_path);
            setNewAlbumsPath(getSettingsResult.data.new_albums_path);
            setAllArtistsPath(getSettingsResult.data.all_artists_path);
        } else if (getSettingsResult.isError) {
            showErrorNotification({ title: "Could not retrieve media path details" });
        }
    }, [getSettingsResult]);

    /**
     * When the settings are updated, notify the user of success/error. If it was successful then
     * call getSettings() again to reset the local state to the new settings values.
     */
    useEffect(() => {
        if (updateSettingsResult.isFetching) {
            return;
        } else if (updateSettingsResult.isSuccess) {
            showSuccessNotification({ title: "Media path details updated" });
            getSettings();
        }
        else if (updateSettingsResult.isError) {
            showErrorNotification({ title: "Could not update media path details" });
        }
    }, [updateSettingsResult, getSettings]);

    /**
     * Store user input for maximum volume in local state.
     */
    const maxVolumeChangeHandler = useCallback(
        (value: number | "") => {
            if (value === "") {
                return;
            }

            setNormalizedMaxVolume(value / 100);
        },
        []
    );

    /**
     * When user is done editing maximum volume, store value in app storage and update the
     * amplifier's current volume if it's currently higher than the new max.
     */
    const maxVolumeBlurHandler = useCallback(
        () => {
            dispatch(setApplicationAmplifierMaxVolume(normalizedMaxVolume));

            amplifier?.volume &&
                normalizedMaxVolume < amplifier.volume &&
                volumeSet(normalizedMaxVolume);

            showSuccessNotification({ title: "Maximum volume updated" });
        }, [normalizedMaxVolume, amplifier, dispatch, volumeSet]);

    // --------------------------------------------------------------------------------------------

    return (
        <Stack>
            {/* User settings ----------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={15}>
                    <StylizedLabel color={colors.dark[3]}>user settings</StylizedLabel>

                    <Checkbox
                        checked={useImageBackground}
                        label="Show art image background in Now Playing screens (dark mode only)"
                        onChange={() =>
                            dispatch(setApplicationUseImageBackground(!useImageBackground))
                        }
                    />

                    <Checkbox
                        checked={autoPlayOnPlaylistActivation}
                        label="Auto-play playlist on activation"
                        onChange={() =>
                            dispatch(
                                setApplicationAutoPlayOnPlaylistActivation(
                                    !autoPlayOnPlaylistActivation
                                )
                            )
                        }
                    />

                    <NumberInput
                        ref={maxVolumeInputRef}
                        label="Maximum amplifier volume"
                        description="From 0 to 100, step is 1"
                        min={0}
                        max={100}
                        precision={0}
                        value={amplifierMaxVolume * 100}
                        maw="12rem"
                        onChange={maxVolumeChangeHandler}
                        onBlur={maxVolumeBlurHandler}
                    />
                    {!amplifier && (
                        <Text size="sm" color={colors.red[7]}>
                            Currently has no effect (no amplifier registered with Vibin)
                        </Text>
                    )}
                </Stack>
            </Paper>

            {/* Web Application ---------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>web application</StylizedLabel>

                    <Flex gap={25} align="flex-start">
                        <Stack spacing={10}>
                            <Box pb={5}>
                                <FieldValueList
                                    fieldValues={{
                                        "UI version": process.env.REACT_APP_VERSION,
                                    }}
                                />
                            </Box>

                            {/* Indicators */}
                            <Flex gap={10}>
                                <WebsocketIndicator />
                                <Text size="sm" weight="bold" color={colors.dark[1]}>
                                    Connection to server
                                </Text>
                                <Text size="sm" weight="bold" color={colors.dark[3]}>
                                    [{websocketStatus}]
                                </Text>
                            </Flex>
                            <Flex gap={10}>
                                <WaitingOnAPIIndicator />
                                <Text size="sm" weight="bold" color={colors.dark[1]}>
                                    API calls
                                </Text>
                            </Flex>
                            <Flex gap={10}>
                                <BackgroundComputeIndicator />
                                <Text size="sm" weight="bold" color={colors.dark[1]}>
                                    Background compute
                                </Text>
                            </Flex>
                        </Stack>
                    </Flex>
                </Stack>
            </Paper>

            {/* Devices ------------------------------------------------------------------------ */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>devices</StylizedLabel>

                    <Flex gap={50}>
                        <FieldValueList
                            rowHeight={1.3}
                            fieldValues={{
                                Streamer: streamer.name || "",
                                "Media Server": mediaServer?.name || "<none>",
                                "Play State": <PlayStateIndicator />,
                                Source: <MediaSourceBadge />,
                            }}
                        />
                        <Button
                            variant="outline"
                            disabled={!mediaServer}
                            size="xs"
                            leftIcon={<IconRefresh size={16} />}
                            onClick={() =>
                                clearMediaCache().then(() => {
                                    showSuccessNotification({
                                        title: "Media information cleared",
                                        message: "Latest media information is being re-fetched",
                                    });

                                    refetchAlbums();
                                    refetchNewAlbums();
                                    refetchArtists();
                                    refetchTracks();
                                })
                            }
                        >
                            Refresh Media
                        </Button>
                    </Flex>
                </Stack>
            </Paper>

            {/* Media paths -------------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>media paths</StylizedLabel>
                    <Text size="sm" color={colors.dark[2]}>
                        Where to find media on the Media Server{" "}
                        {mediaServer?.name && `(${mediaServer?.name})`}. Track details will be
                        retrieved from the All Albums path.
                    </Text>
                    <Text size="sm" weight="bold" color={colors.dark[2]}>
                        After changing paths, click "Refresh Media" above to force a refresh.
                    </Text>
                    {!mediaServer && (
                        <Text size="sm" color={colors.red[7]}>
                            Currently has no effect (no media server registered with Vibin)
                        </Text>
                    )}

                    <Stack spacing={10} pt={10}>
                        {/* All Albums */}
                        <Flex gap={10} align="center">
                            <Flex w="6rem" justify="flex-end">
                                <Text size="sm" color={colors.dark[3]}>
                                    All Albums
                                </Text>
                            </Flex>
                            <Box w="20rem">
                                <TextInput
                                    disabled={getSettingsResult.isFetching}
                                    value={allAlbumsPath || ""}
                                    onChange={(event) =>
                                        setAllAlbumsPath(event.currentTarget.value)
                                    }
                                    onBlur={() => {
                                        if (
                                            allAlbumsPath ===
                                            getSettingsResult?.data?.all_albums_path
                                        ) {
                                            return;
                                        }

                                        updateSettings({
                                            ...getSettingsResult.data,
                                            all_albums_path: allAlbumsPath,
                                        } as VibinSettings);
                                    }}
                                />
                            </Box>
                        </Flex>

                        {/* New Albums */}
                        <Flex gap={10} align="center">
                            <Flex w="6rem" justify="flex-end">
                                <Text size="sm" color={colors.dark[3]}>
                                    New Albums
                                </Text>
                            </Flex>
                            <Box w="20rem">
                                <TextInput
                                    disabled={getSettingsResult.isFetching}
                                    value={newAlbumsPath || ""}
                                    onChange={(event) =>
                                        setNewAlbumsPath(event.currentTarget.value)
                                    }
                                    onBlur={() => {
                                        if (
                                            newAlbumsPath ===
                                            getSettingsResult?.data?.new_albums_path
                                        ) {
                                            return;
                                        }

                                        updateSettings({
                                            ...getSettingsResult.data,
                                            new_albums_path: newAlbumsPath,
                                        } as VibinSettings);
                                    }}
                                />
                            </Box>
                        </Flex>

                        {/* All Artists */}
                        <Flex gap={10} align="center">
                            <Flex w="6rem" justify="flex-end">
                                <Text size="sm" color={colors.dark[3]}>
                                    All Artists
                                </Text>
                            </Flex>
                            <Box w="20rem">
                                <TextInput
                                    disabled={getSettingsResult.isFetching}
                                    value={allArtistsPath || ""}
                                    onChange={(event) =>
                                        setAllArtistsPath(event.currentTarget.value)
                                    }
                                    onBlur={() => {
                                        if (
                                            allArtistsPath ===
                                            getSettingsResult?.data?.all_artists_path
                                        ) {
                                            return;
                                        }

                                        updateSettings({
                                            ...getSettingsResult.data,
                                            all_artists_path: allArtistsPath,
                                        } as VibinSettings);
                                    }}
                                />
                            </Box>
                        </Flex>
                    </Stack>
                </Stack>
            </Paper>

            {/* Server ------------------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>server</StylizedLabel>

                    <FieldValueList
                        fieldValues={{
                            Host: systemNode,
                            "Vibin version": vibinVersion,
                            "Start time": startTime ? (
                                <SelfUpdatingRelativeDate epochSeconds={startTime} />
                            ) : (
                                ""
                            ),
                            Platform: systemPlatform,
                        }}
                    />

                    <Stack pt={10} spacing={0}>
                        <Text size="sm" transform="uppercase" weight="bold" color={colors.dark[2]}>
                            Client Connections
                        </Text>

                        <Table striped highlightOnHover w="fit-content" horizontalSpacing={50}>
                            <thead>
                                <tr>
                                    <th>IP</th>
                                    <th>Port</th>
                                    <th>Connection time</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...clients]
                                    .sort((clientA, clientB) =>
                                        clientB.when_connected
                                            .toString()
                                            .localeCompare(
                                                clientA.when_connected.toString(),
                                                undefined,
                                                {
                                                    numeric: true,
                                                }
                                            )
                                    )
                                    .map((client) => (
                                        <tr key={client.id}>
                                            <td>{client.ip}</td>
                                            <td>{client.port}</td>
                                            <td>
                                                <SelfUpdatingRelativeDate
                                                    epochSeconds={client.when_connected}
                                                />
                                            </td>
                                            <td>
                                                {client.id === websocketClientId && (
                                                    <Tooltip label="This is you">
                                                        <Center w="fit-content">
                                                            <IconMoodSmile />
                                                        </Center>
                                                    </Tooltip>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
};

export default StatusScreen;

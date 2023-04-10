import React, { FC } from "react";
import {
    Button,
    Center,
    Checkbox,
    Flex,
    Paper,
    Stack,
    Table,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconMoodSmile, IconRefresh } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/useInterval";
import { RootState } from "../../../app/store/store";
import { useLazyClearMediaCachesQuery } from "../../../app/services/vibinVibin";
import { useGetAlbumsQuery, useGetNewAlbumsQuery } from "../../../app/services/vibinAlbums";
import { useGetArtistsQuery } from "../../../app/services/vibinArtists";
import { useGetTracksQuery } from "../../../app/services/vibinTracks";
import { showSuccessNotification } from "../../../app/utils";
import { setApplicationUseImageBackground } from "../../../app/store/userSettingsSlice";
import StylizedLabel from "../../shared/textDisplay/StylizedLabel";
import FieldValueList from "../../shared/dataDisplay/FieldValueList";
import BackgroundComputeIndicator from "../../shared/dataDisplay/BackgroundComputeIndicator";
import WaitingOnAPIIndicator from "../../shared/dataDisplay/WaitingOnAPIIndicator";
import WebsocketIndicator from "../../shared/dataDisplay/WebsocketIndicator";
import PlayStateIndicator from "../../shared/dataDisplay/PlayStateIndicator";
import MediaSourceBadge from "../../shared/dataDisplay/MediaSourceBadge";
import SelfUpdatingRelativeDate from "../../shared/dataDisplay/SelfUpdatingRelativeDate";

const StatusScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const [clearMediaCache, clearMediaCacheStatus] = useLazyClearMediaCachesQuery();
    const { refetch: refetchAlbums } = useGetAlbumsQuery();
    const { refetch: refetchNewAlbums } = useGetNewAlbumsQuery();
    const { refetch: refetchArtists } = useGetArtistsQuery();
    const { refetch: refetchTracks } = useGetTracksQuery();
    const { streamer, media_device: mediaDevice } = useAppSelector(
        (state: RootState) => state.system
    );
    const { websocketClientId, websocketStatus } = useAppSelector(
        (state: RootState) => state.internal.application
    );
    const {
        start_time: startTime,
        system_node: systemNode,
        system_platform: systemPlatform,
        clients,
    } = useAppSelector((state: RootState) => state.vibinStatus);
    const { useImageBackground } = useAppSelector(
        (state: RootState) => state.userSettings.application
    );    

    return (
        <Stack>
            {/* User settings ----------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>user settings</StylizedLabel>

                    <Checkbox
                        checked={useImageBackground}
                        label="Show art image background in Now Playing screens (dark mode only)"
                        onClick={() =>
                            dispatch(setApplicationUseImageBackground(!useImageBackground))
                        }
                    />
                </Stack>
            </Paper>

            {/* Web Application ---------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>web application</StylizedLabel>

                    <Flex gap={25} align="flex-start">
                        {/* Indicators */}
                        <Stack spacing={10}>
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

                        {/* Active API calls */}
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
                                Media: mediaDevice.name || "",
                                "Play State": <PlayStateIndicator />,
                                Source: <MediaSourceBadge />,
                            }}
                        />
                        <Button
                            variant="outline"
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

            {/* Server ------------------------------------------------------------------------- */}

            <Paper pt={5} p={15} shadow="xs">
                <Stack spacing={10}>
                    <StylizedLabel color={colors.dark[3]}>server</StylizedLabel>

                    <FieldValueList
                        fieldValues={{
                            Host: systemNode,
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

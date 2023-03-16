import React, { FC } from "react";
import { Center, Flex, Paper, Stack, Table, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { IconMoodSmile } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import StylizedLabel from "../shared/StylizedLabel";
import FieldValueList from "../fieldValueList/FieldValueList";
import BackgroundComputeIndicator from "../shared/BackgroundComputeIndicator";
import WaitingOnAPIIndicator from "../shared/WaitingOnAPIIndicator";
import WebsocketIndicator from "../shared/WebsocketIndicator";
import PlayStateIndicator from "../shared/PlayStateIndicator";
import MediaSourceBadge from "../shared/MediaSourceBadge";
import SelfUpdatingRelativeDate from "../shared/SelfUpdatingRelativeDate";

const StatusScreen: FC = () => {
    const { colors } = useMantineTheme();
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

    return (
        <Stack>
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

                    <FieldValueList
                        rowHeight={1.3}
                        fieldValues={{
                            Streamer: streamer.name || "",
                            Media: mediaDevice.name || "",
                            "Play State": <PlayStateIndicator />,
                            Source: <MediaSourceBadge />,
                        }}
                    />
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

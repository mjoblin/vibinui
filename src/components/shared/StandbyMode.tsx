import React, { FC, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ActionIcon, Flex, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPower } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";

/**
 *
 */
const StandbyMode: FC = () => {
    const streamerName = useAppSelector((state: RootState) => state.system.streamer.name);
    const [togglePower, togglePowerStatus] = useLazyPowerToggleQuery();

    useEffect(() => {
        if (togglePowerStatus.isError) {
            const { status, data } = togglePowerStatus.error as FetchBaseQueryError;

            showNotification({
                title: "Could not power on the streamer",
                message: `[${status}] ${data}`,
                autoClose: false,
            });
        }
    }, [togglePowerStatus]);

    return (
        <Flex pt={35} gap={15} justify="center" align="center">
            <ActionIcon
                size="lg"
                color="blue"
                variant="filled"
                radius={5}
                onClick={() => togglePower()}
            >
                <IconPower size={20} />
            </ActionIcon>
            <Text>{`${streamerName} is in standby mode`}</Text>
        </Flex>
    );
};

export default StandbyMode;
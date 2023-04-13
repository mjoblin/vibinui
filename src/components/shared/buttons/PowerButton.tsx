import React, { FC, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconThumbUp, IconPower } from "@tabler/icons";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useLazyPowerToggleQuery } from "../../../app/services/vibinSystem";
import { showErrorNotification } from "../../../app/utils";

// ================================================================================================
// Button to turn on the streamer. Shows a thumbs-up icon if the stream is already on.
// ================================================================================================

const PowerButton: FC = () => {
    const { name: streamerName, power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const [togglePower, togglePowerStatus] = useLazyPowerToggleQuery();

    /**
     * Display an error notification if the attempt to toggle power failed.
     */
    useEffect(() => {
        if (togglePowerStatus.isError) {
            const { status, data } = togglePowerStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Could not power on the streamer",
                message: `[${status}] ${data}`,
            });
        }
    }, [togglePowerStatus]);

    const isInStandbyMode = streamerPower === "off";

    return (
        <Tooltip
            label={isInStandbyMode ? `Power on ${streamerName}` : `${streamerName} is powered on`}
            position="top"
            withArrow
        >
            <Box>
                <ActionIcon
                    disabled={!isInStandbyMode}
                    size="lg"
                    color="blue"
                    variant="filled"
                    radius={5}
                    onClick={() => togglePower()}
                >
                    {isInStandbyMode ? <IconPower size={20} /> : <IconThumbUp size={20} />}
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default PowerButton;
import React, { FC, useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconThumbUp, IconPower } from "@tabler/icons";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";
import { showErrorNotification } from "../../app/utils";

const PowerButton: FC = () => {
    const streamerName = useAppSelector((state: RootState) => state.system.streamer.name);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const [togglePower, togglePowerStatus] = useLazyPowerToggleQuery();

    useEffect(() => {
        if (togglePowerStatus.isError) {
            const { status, data } = togglePowerStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Could not power on the streamer",
                message: `[${status}] ${data}`,
            });
        }
    }, [togglePowerStatus]);

    const isInStandbyMode = playStatus === "not_ready";

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
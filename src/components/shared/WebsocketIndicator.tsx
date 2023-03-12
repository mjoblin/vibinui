import React, { FC } from "react";
import { ColorSwatch, MantineColor, Tooltip, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const WebsocketIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const { TEMPORARY_ACTIVITY_COLOR } = useAppConstants();
    const { websocketStatus } = useAppSelector((state: RootState) => state.internal.application);

    const statusColors: Record<string, MantineColor> = {
        fulfilled: colors.green[9],
        pending: TEMPORARY_ACTIVITY_COLOR,
    };

    return (
        <Tooltip label={`Websocket status: ${websocketStatus}`}>
            <ColorSwatch
                size={20}
                color={
                    websocketStatus && statusColors[websocketStatus]
                        ? statusColors[websocketStatus]
                        : colors.red[9]
                }
            />
        </Tooltip>
    );
};

export default WebsocketIndicator;

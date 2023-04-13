import React, { FC } from "react";
import { ColorSwatch, MantineColor, Tooltip, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { WebsocketStatus } from "../../../app/store/internalSlice";

// ================================================================================================
// Indicator showing the current state of the WebSocket connection to the vibin backend.
// ================================================================================================

const WebsocketIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const { TEMPORARY_ACTIVITY_COLOR } = useAppGlobals();
    const { websocketStatus } = useAppSelector((state: RootState) => state.internal.application);

    const statusColors: Record<WebsocketStatus, MantineColor> = {
        connected: colors.green[9],
        connecting: TEMPORARY_ACTIVITY_COLOR,
        disconnected: colors.red[9],
        waiting_to_reconnect: colors.yellow[2],
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

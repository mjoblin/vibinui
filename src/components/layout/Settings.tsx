import React, { FC } from "react";
import { Box, Switch, Tooltip } from "@mantine/core";

import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";

const Settings: FC = () => {
    const [togglePower] = useLazyPowerToggleQuery();
    const streamer = useAppSelector((state: RootState) => state.system.streamer);

    return (
        <Tooltip
            label={`Turn ${streamer.name} ${streamer.power === "on" ? "off" : "on"}`}
            color="blue"
            openDelay={500}
            withArrow
            arrowSize={8}
            styles={{ tooltip: { fontSize: 12 } }}
        >
            <Box>
                <Switch
                    label={streamer.name}
                    checked={streamer.power === "on"}
                    onChange={(event) => togglePower()}
                    onLabel="on"
                    offLabel="off"
                />
            </Box>
        </Tooltip>
    );
};

export default Settings;

import React, { FC } from "react";
import { Box, Switch } from "@mantine/core";

import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";

const Settings: FC = () => {
    const [togglePower] = useLazyPowerToggleQuery();
    const streamer = useAppSelector((state: RootState) => state.system.streamer);

    return (
        <Box>
            <Switch
                label={streamer.name}
                checked={streamer.power === "on"}
                onChange={(event) => togglePower()}
                onLabel="on"
                offLabel="off"
            />
        </Box>
    );
};

export default Settings;

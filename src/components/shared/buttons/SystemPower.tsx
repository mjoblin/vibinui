import React, { FC } from "react";
import { ActionIcon, Box, Flex, Text, Tooltip } from "@mantine/core";
import { IconArrowDownCircle, IconPower } from "@tabler/icons";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useAmplifierPowerSetMutation,
    useStreamerPowerSetMutation,
} from "../../../app/services/vibinSystem";

// ================================================================================================
// Power the system on/off.
// ================================================================================================

type SystemPowerProps = {
    showPowerOn?: boolean;
    showPowerOff?: boolean;
    label?: string;
};

const SystemPower: FC<SystemPowerProps> = ({
    showPowerOn = true,
    showPowerOff = true,
    label = "",
}) => {
    const [amplifierPowerSet] = useAmplifierPowerSetMutation();
    const [streamerPowerSet] = useStreamerPowerSetMutation();
    const streamerPower = useAppSelector((state: RootState) => state.system.streamer.power);
    const amplifierPower = useAppSelector((state: RootState) => state.system.amplifier?.power);

    return (
        <Flex gap={10} justify="center" align="center">
            {showPowerOff && (
                <Tooltip label="Power system off" position="top" withArrow>
                    <Box>
                        <ActionIcon
                            size="lg"
                            color="blue"
                            variant="light"
                            radius={5}
                            onClick={() => {
                                streamerPowerSet("off");
                                amplifierPower && amplifierPowerSet("off");
                            }}
                        >
                            <IconArrowDownCircle size={20} />
                        </ActionIcon>
                    </Box>
                </Tooltip>
            )}

            {showPowerOn && (
                <Tooltip label="Power system on" position="top" withArrow>
                    <Box>
                        <ActionIcon
                            size="lg"
                            color="blue"
                            variant={
                                streamerPower === "off" || amplifierPower === "off"
                                    ? "light"
                                    : "transparent"
                            }
                            radius={5}
                            onClick={() => {
                                streamerPowerSet("on");
                                amplifierPower && amplifierPowerSet("on");
                            }}
                        >
                            <IconPower size={20} />
                        </ActionIcon>
                    </Box>
                </Tooltip>
            )}

            {label !== "" && <Text>{label}</Text>}
        </Flex>
    );
};

export default SystemPower;

import React, { FC } from "react";
import { ActionIcon, Box, Flex, Text, Tooltip } from "@mantine/core";
import { IconPower } from "@tabler/icons";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useSystemPowerSetMutation } from "../../../app/services/vibinSystem";

// ================================================================================================
// Power the system on/off.
// ================================================================================================

type SystemPowerProps = {
    label?: string;
};

const SystemPower: FC<SystemPowerProps> = ({ label = "" }) => {
    const [systemPowerSet] = useSystemPowerSetMutation();
    const systemPower = useAppSelector((state: RootState) => state.system.power);

    return (
        <Flex gap={10} justify="center" align="center">
            <Tooltip
                label={`Power system ${systemPower === "on" ? "off" : "on"}`}
                position="top"
                withArrow
            >
                <Box>
                    <ActionIcon
                        size="lg"
                        color={systemPower === "on" ? "red" : "blue"}
                        variant={systemPower === "on" ? "light" : "filled"}
                        radius={5}
                        onClick={() => systemPowerSet(systemPower === "on" ? "off" : "on")}
                    >
                        <IconPower size={20} />
                    </ActionIcon>
                </Box>
            </Tooltip>

            {label !== "" && <Text>{label}</Text>}
        </Flex>
    );
};

export default SystemPower;

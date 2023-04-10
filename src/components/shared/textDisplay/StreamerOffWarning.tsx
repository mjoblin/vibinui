import React, { FC } from "react";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

import { useAppSelector } from "../../../app/hooks/useInterval";
import { RootState } from "../../../app/store/store";

/**
 *
 */
const StreamerOffWarning: FC = () => {
    const { colors } = useMantineTheme();
    const streamerName = useAppSelector((state: RootState) => state.system.streamer.name);

    return (
        <Flex gap={8} align="center">
            <IconAlertCircle size={16} color={colors.yellow[4]} />
            <Text color={colors.yellow[4]} size={12} weight="bold" transform="uppercase">{`${
                streamerName || "streamer"
            } is in standby`}</Text>
        </Flex>
    );
};

export default StreamerOffWarning;

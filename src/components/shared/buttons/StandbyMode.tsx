import React, { FC } from "react";
import { Flex, Text } from "@mantine/core";

import { useAppSelector } from "../../../app/hooks/useInterval";
import { RootState } from "../../../app/store/store";
import PowerButton from "./PowerButton";

type StandbyModeProps = {
    type?: "compact" | "normal";
};

/**
 *
 */
const StandbyMode: FC<StandbyModeProps> = ({ type = "normal" }) => {
    const streamerName = useAppSelector((state: RootState) => state.system.streamer.name);

    return type === "compact" ? (
        <PowerButton />
    ) : (
        <Flex pt={35} gap={15} justify="center" align="center">
            <PowerButton />
            <Text>{`${streamerName} is in standby mode`}</Text>
        </Flex>
    );
};

export default StandbyMode;

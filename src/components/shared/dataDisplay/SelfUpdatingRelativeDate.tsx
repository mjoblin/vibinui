import React, { FC, useEffect, useState } from "react";
import { Text } from "@mantine/core";
import { useInterval } from "@mantine/hooks";

import { epochSecondsToStringRelative } from "../../../app/utils";

type UpdatingRelativeDateProps = {
    epochSeconds: number;
    interval?: number;
};

const SelfUpdatingRelativeDate: FC<UpdatingRelativeDateProps> = ({
    epochSeconds,
    interval = 5000,
}) => {
    const [dateString, setDateString] = useState<string>(
        epochSecondsToStringRelative(epochSeconds)
    );
    const updater = useInterval(
        () => setDateString(() => epochSecondsToStringRelative(epochSeconds)),
        interval
    );

    useEffect(() => {
        updater.start();
        return updater.stop;
    }, [updater]);

    return <Text>{dateString}</Text>;
};

export default SelfUpdatingRelativeDate;

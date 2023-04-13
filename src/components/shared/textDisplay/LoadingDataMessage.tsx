import React, { FC, useState } from "react";
import { Flex, Loader, Text } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";

// ================================================================================================
// A loader to show when retrieving data. Will not be displayed until the delay (ms) has passed
// (defaults to 500ms/0.5s).
//
// The use case for the delay is to reduce the number of times the loader will flash on briefly.
// If the consumer receives its response before the delay interval, then this loader shouldn't
// show; which provides a less noisy UX.
//
// TODO: This component's name could be confusing. It's really a <DelayedLoader>. Keeping it named
//  <LoadingDataMessage> for now as that more clearly describes its intent in this app; but that's
//  debatable.
// ================================================================================================

type LoadingDataMessageProps = {
    message: string;
    delay?: number;
};

const LoadingDataMessage: FC<LoadingDataMessageProps> = ({ message, delay = 500 }) => {
    const [show, setShow] = useState<boolean>(false);
    useTimeout(() => setShow(true), delay, { autoInvoke: true });

    return show ? (
        <Flex gap="sm" align="center">
            <Loader size="sm" />
            <Text size="sm">{message}</Text>
        </Flex>
    ) : null;
};

export default LoadingDataMessage;

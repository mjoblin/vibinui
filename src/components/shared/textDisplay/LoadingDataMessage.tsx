import React, { FC, useState } from "react";
import { Flex, Loader, Text } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";

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

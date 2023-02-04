import React, { FC } from "react";
import { Flex, Loader, MantineSize, Text } from "@mantine/core";

type SimpleLoaderProps = {
    size?: MantineSize;
    label?: string;
};

const SimpleLoader: FC<SimpleLoaderProps> = ({ size = "sm", label = "" }) => {
    return (
        <Flex gap="xs" align="center">
            <Loader size={size} />
            <Text size="sm">{label}</Text>
        </Flex>
    );
};

export default SimpleLoader;

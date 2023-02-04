import React, { FC } from "react";
import { Flex, Text } from "@mantine/core";

type SadLabelProps = {
    label: string;
};

const SadLabel: FC<SadLabelProps> = ({ label }) => {
    return (
        <Flex gap="xs">
            <Text>😔</Text>
            <Text>{label}</Text>
        </Flex>
    );
};

export default SadLabel;

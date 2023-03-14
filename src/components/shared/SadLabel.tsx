import React, { FC } from "react";
import { Flex, Text } from "@mantine/core";

type SadLabelProps = {
    label: string;
    labelSize?: number;
    sadSize?: number;
};

const SadLabel: FC<SadLabelProps> = ({ label, labelSize = 16, sadSize = 26 }) => {
    return (
        <Flex gap="0.8rem" align="center">
            <Text size={sadSize}>😔</Text>
            <Text size={labelSize} weight="bold" miw="fit-content">{label}</Text>
        </Flex>
    );
};

export default SadLabel;

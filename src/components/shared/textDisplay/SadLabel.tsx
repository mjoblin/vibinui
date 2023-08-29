import React, { FC } from "react";
import { Flex, Text } from "@mantine/core";

// ================================================================================================
// A label paired with an optional sad-face emoji.
// ================================================================================================

type SadLabelProps = {
    label: string;
    labelSize?: number;
    sadSize?: number;
    weight?: string;
    showEmoji?: boolean;
};

const SadLabel: FC<SadLabelProps> = ({
    label,
    labelSize = 16,
    sadSize = 26,
    weight = "bold",
    showEmoji = false,
}) => {
    return (
        <Flex gap="0.8rem" align="center" miw="15rem">
            {showEmoji && <Text size={sadSize}>😔</Text>}
            <Text size={labelSize} weight={weight} miw="fit-content">
                {label}
            </Text>
        </Flex>
    );
};

export default SadLabel;

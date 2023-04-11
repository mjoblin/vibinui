import React, { FC } from "react";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

type WarningMessageProps = {
    message: string;
};

/**
 *
 */
const WarningMessage: FC<WarningMessageProps> = ({ message }) => {
    const { colors } = useMantineTheme();

    return (
        <Flex gap={8} align="center">
            <IconAlertCircle size={16} color={colors.yellow[4]} />
            <Text color={colors.yellow[4]} size={12} weight="bold" transform="uppercase">
                {message}
            </Text>
        </Flex>
    );
};

export default WarningMessage;

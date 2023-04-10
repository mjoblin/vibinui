import React, { FC } from "react";
import { Box, Center, MantineColor, Text, useMantineTheme } from "@mantine/core";

type NoArtPlaceholderProps = {
    artSize: number;
    backgroundColor?: MantineColor;
};
const NoArtPlaceholder: FC<NoArtPlaceholderProps> = ({ artSize, backgroundColor }) => {
    const { colors } = useMantineTheme();

    return (
        <Box w="100%" h="100%" bg={backgroundColor ? backgroundColor : colors.dark[6]}>
            <Center w="100%" h="100%">
                <Text
                    transform="uppercase"
                    weight="bold"
                    sx={{ textAlign: "center" }}
                    size={artSize >= 40 ? 11 : 9}
                >
                    no art
                </Text>
            </Center>
        </Box>
    );
};

export default NoArtPlaceholder;

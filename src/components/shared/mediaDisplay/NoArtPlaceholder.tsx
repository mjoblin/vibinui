import React, { FC } from "react";
import { Box, Center, MantineColor, Text, useMantineTheme } from "@mantine/core";

// ================================================================================================
// Placeholder for when no art is available for a media item.
// ================================================================================================

type NoArtPlaceholderProps = {
    artSize?: number;
    radius?: number;
    backgroundColor?: MantineColor;
    borderRadius?: number;
};

const NoArtPlaceholder: FC<NoArtPlaceholderProps> = ({ artSize, backgroundColor, radius = 0 }) => {
    const { colors } = useMantineTheme();

    return (
        <Box
            w="100%"
            h="100%"
            bg={backgroundColor ? backgroundColor : colors.dark[5]}
            sx={{ borderRadius: radius }}
        >
            <Center w="100%" h="100%">
                <Text
                    transform="uppercase"
                    weight="bold"
                    sx={{ textAlign: "center" }}
                    size={artSize && (artSize >= 40 ? 11 : 6)}
                >
                    no art
                </Text>
            </Center>
        </Box>
    );
};

export default NoArtPlaceholder;

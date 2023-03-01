import React, { FC, ReactNode } from "react";
import { Box, Flex, Image, Paper, Stack, useMantineTheme } from "@mantine/core";

type CompactArtCardProps = {
    artUrl: string;
    actions?: ReactNode;
    onClick?: () => void;
    children: ReactNode;
};

const CompactArtCard: FC<CompactArtCardProps> = ({ artUrl, actions = null, onClick, children }) => {
    const { colors } = useMantineTheme();

    return (
        <Paper bg={colors.dark[6]} radius={5} pr={10} onClick={() => onClick && onClick()}>
            <Flex align="center" justify="space-between" gap={10} w="100%">
                <Flex align="center" gap={10}>
                    <Image src={artUrl} width={70} height={70} radius={5} fit="cover" />
                    <Stack spacing={5}>{children}</Stack>
                </Flex>

                <Box sx={{ alignSelf: "right" }}>{actions}</Box>
            </Flex>
        </Paper>
    );
};

export default CompactArtCard;
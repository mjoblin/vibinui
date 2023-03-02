import React, { FC, ReactNode } from "react";
import { Box, createStyles, Flex, Image, Paper, Stack, useMantineTheme } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";

type CompactArtCardProps = {
    artUrl?: string;
    actions?: ReactNode;
    selected?: boolean;
    onClick?: () => void;
    children: ReactNode;
};

const CompactArtCard: FC<CompactArtCardProps> = ({
    artUrl,
    actions = null,
    selected = false,
    onClick,
    children,
}) => {
    const { colors } = useMantineTheme();
    const { SELECTED_COLOR } = useAppConstants();
    
    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        compactArtCard: {
            border: selected
                ? `${borderSize}px solid ${SELECTED_COLOR}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
            "&:hover": {
                cursor: onClick ? "pointer" : "inherit",
            },
        },
    }))();

    return (
        <Paper
            bg={colors.dark[6]}
            radius={5}
            pr={10}
            className={dynamicClasses.compactArtCard}
            onClick={() => onClick && onClick()}
        >
            <Flex align="center" justify="space-between" gap={10} w="100%">
                <Flex align="center">
                    {artUrl &&
                        <Image src={artUrl} width={70} height={70} radius={5} fit="cover" />
                    }
                    <Stack spacing={5} p={10}>{children}</Stack>
                </Flex>

                <Box sx={{ alignSelf: "right" }}>{actions}</Box>
            </Flex>
        </Paper>
    );
};

export default CompactArtCard;

import React, { FC, ReactNode } from "react";
import { Box, createStyles, Flex, Image, Paper, Stack } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";

type CompactArtCardProps = {
    artUrl?: string;
    actions?: ReactNode;
    selected?: boolean;
    isCurrentlyPlaying?: boolean;
    onClick?: () => void;
    children: ReactNode;
};

const CompactArtCard: FC<CompactArtCardProps> = ({
    artUrl,
    actions = null,
    selected = false,
    isCurrentlyPlaying = false,
    onClick,
    children,
}) => {
    const { SELECTED_COLOR, CURRENTLY_PLAYING_COLOR } = useAppConstants();
    
    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        compactArtCard: {
            border: isCurrentlyPlaying
                ? `${borderSize}px solid ${CURRENTLY_PLAYING_COLOR}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
            backgroundColor: selected ? SELECTED_COLOR : theme.colors.dark[6],
            "&:hover": {
                cursor: onClick ? "pointer" : "inherit",
            },
        },
    }))();

    return (
        <Paper
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

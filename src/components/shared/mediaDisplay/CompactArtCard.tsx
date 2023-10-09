import React, { FC, ReactNode } from "react";
import {
    Box,
    createStyles,
    Flex,
    Paper,
    Stack,
} from "@mantine/core";

import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { Media } from "../../../app/types";
import MediaArt from "./MediaArt";

// ================================================================================================
// A compact media card. Shows art on the left, and children (likely media details like title and
// artist) on the right.
// ================================================================================================

type CompactArtCardProps = {
    media?: Media;
    artUrl?: string;
    actions?: ReactNode;
    selected?: boolean;
    isCurrentlyPlaying?: boolean;
    showLoading?: boolean;
    onClick?: () => void;
    children: ReactNode;
};

const CompactArtCard: FC<CompactArtCardProps> = ({
    media,
    artUrl,
    actions = null,
    selected = false,
    isCurrentlyPlaying = false,
    showLoading = true,
    onClick,
    children,
}) => {
    const { SELECTED_COLOR, CURRENTLY_PLAYING_COLOR } = useAppGlobals();

    const artSize = 70;
    const borderSize = 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        compactArtCard: {
            border: isCurrentlyPlaying
                ? `${borderSize}px solid ${CURRENTLY_PLAYING_COLOR}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
            backgroundColor: selected
                ? SELECTED_COLOR
                : theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[3],
            "&:hover": {
                cursor: onClick ? "pointer" : "inherit",
            },
        },
    }))();

    return (
        <Paper
            radius={5}
            pr={10}
            miw={300}
            className={dynamicClasses.compactArtCard}
            onClick={() => onClick && onClick()}
        >
            <Flex align="flex-start" justify="space-between" gap={10} w="100%">
                <Flex align="flex-start">
                    {artUrl && (
                        <MediaArt
                            media={media}
                            artUri={artUrl}
                            radius={5}
                            size={artSize}
                            showActions={false}
                            showFavoriteIndicator={false}
                            showPlayButton={true}
                            centerPlayButton={true}
                            showLoading={showLoading}
                        />
                    )}
                    <Stack spacing={5} p={10}>
                        {children}
                    </Stack>
                </Flex>

                <Box sx={{ alignSelf: "center" }}>{actions}</Box>
            </Flex>
        </Paper>
    );
};

export default CompactArtCard;

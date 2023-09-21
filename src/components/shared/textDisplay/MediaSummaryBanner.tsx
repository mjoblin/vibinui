import React, { FC } from "react";
import { Box, Flex, Stack, Text, useMantineTheme } from "@mantine/core";

import { isAlbum, isTrack, isPreset, Media } from "../../../app/types";
import { yearFromDate } from "../../../app/utils";
import MediaArt from "../mediaDisplay/MediaArt";
import MediaActionsButton from "../buttons/MediaActionsButton";

// ================================================================================================
// A banner/header intended to summarize an item of media (will likely be used as a header to be
// paired with some additional details about the media).
//
// Contents:
//  - Media art on the left.
//  - Media summary details on the right (title, artist, date, etc).
//  - An optional separate actions button (to invoke actions on the media).
// ================================================================================================

type MediaSummaryBannerProps = {
    media: Media;
    showArt?: boolean;
    showArtControls?: boolean;
    showSeparateActionsButton?: boolean;
};

const MediaSummaryBanner: FC<MediaSummaryBannerProps> = ({
    media,
    showArt = true,
    showArtControls = false,
    showSeparateActionsButton = false,
}) => {
    const { colors } = useMantineTheme();

    return (
        <Flex gap="md" justify="space-between">
            {showArt && (
                <MediaArt
                    media={media}
                    size={100}
                    showActions={showArtControls}
                    showPlayButton={showArtControls}
                    actionsMenuPosition={"bottom"}
                />
            )}

            {isAlbum(media) ||
                (isTrack(media) && (
                    <Stack sx={{ gap: 0, flexGrow: 1 }}>
                        <Text size="lg" weight="bold" sx={{ lineHeight: 1.25 }}>
                            {media.title}
                        </Text>
                        <Text size="md" sx={{ lineHeight: 1.25 }}>
                            {media.artist}
                        </Text>
                        <Text size="xs" weight="bold" color={colors.dark[3]}>
                            {(media.date && yearFromDate(media.date)) || ""}
                            {media.genre && media.genre.toLowerCase() !== "unknown"
                                ? ` • ${media.genre.toUpperCase()}`
                                : ""}
                        </Text>
                    </Stack>
                ))}

            {isPreset(media) && (
                <Stack sx={{ gap: 0, flexGrow: 1 }}>
                    <Text size="lg" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {media.name}
                    </Text>
                    <Text size="xs" weight="bold" color={colors.dark[3]}>
                        {media.type}
                    </Text>
                </Stack>
            )}

            {showSeparateActionsButton && (
                <Box pr={5}>
                    <MediaActionsButton media={media} position="bottom" />
                </Box>
            )}
        </Flex>
    );
};

export default MediaSummaryBanner;

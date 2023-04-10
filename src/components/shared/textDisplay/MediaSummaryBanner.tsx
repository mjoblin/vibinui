import React, { FC } from "react";
import { Box, Flex, Stack, Text, useMantineTheme } from "@mantine/core";

import { Album, Track } from "../../../app/types";
import { yearFromDate } from "../../../app/utils";
import AlbumArt from "../../features/albums/AlbumArt";
import TrackArt from "../../features/tracks/TrackArt";
import MediaActionsButton from "../buttons/MediaActionsButton";

type MediaSummaryBannerProps = {
    media: Album | Track;
    showArtControls?: boolean;
    showSeparateActionsButton?: boolean;
};

const MediaSummaryBanner: FC<MediaSummaryBannerProps> = ({
    media,
    showArtControls = false,
    showSeparateActionsButton = false,
}) => {
    const { colors } = useMantineTheme();

    const isTrack = "album" in media;

    return (
        <Flex gap="md" justify="space-between">
            {isTrack ? (
                <TrackArt
                    track={media as Track}
                    size={100}
                    showControls={showArtControls}
                    actionsMenuPosition={"bottom"}
                />
            ) : (
                <AlbumArt
                    album={media as Album}
                    size={100}
                    showControls={showArtControls}
                    actionsMenuPosition={"bottom"}
                />
            )}

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

            {showSeparateActionsButton && (
                <Box pr={5}>
                    <MediaActionsButton
                        media={media}
                        mediaType={isTrack ? "track" : "album"}
                        position="bottom"
                    />
                </Box>
            )}
        </Flex>
    );
};

export default MediaSummaryBanner;

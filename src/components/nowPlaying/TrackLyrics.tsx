import React, { FC } from "react";
import { Box, Stack, Text } from "@mantine/core";

import { LyricChunk, useGetLyricsQuery } from "../../app/services/vibinTracks";

type TrackLyricsProps = {
    trackId: string;
};

const TrackLyrics: FC<TrackLyricsProps> = ({ trackId }) => {
    const { data, error, isLoading } = useGetLyricsQuery(trackId);

    // TODO: Add loading state
    if (!data) {
        return <></>;
    }

    const chunkRender = (chunk: LyricChunk) => {
        return (
            <Box>
                {chunk.header && <Text weight="bold">{chunk.header}</Text>}
                {chunk.body.map((line) => (
                    <Text weight="normal">{line}</Text>
                ))}
            </Box>
        );
    };

    return <Stack>{data.map(chunkRender)}</Stack>;
};

export default TrackLyrics;

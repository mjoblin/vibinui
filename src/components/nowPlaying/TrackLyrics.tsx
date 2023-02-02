import React, { FC } from "react";
import { Box, Loader, Stack, Text } from "@mantine/core";

import { LyricChunk, useGetLyricsQuery } from "../../app/services/vibinTracks";

type TrackLyricsProps = {
    trackId: string;
};

const TrackLyrics: FC<TrackLyricsProps> = ({ trackId }) => {
    const { data, error, isFetching } = useGetLyricsQuery(trackId);

    // TODO: Add loading state
    if (!data) {
        return <></>;
    }

    if (isFetching) {
        return <Loader />
    }

    const chunkRender = (chunk: LyricChunk, chunkIndex: number) => {
        return (
            <Box key={`chunk_${chunkIndex}`}>
                {chunk.header && <Text weight="bold">{chunk.header}</Text>}
                {chunk.body.map((line, lineIndex) => (
                    <Text key={`line_${chunkIndex}_${lineIndex}`} weight="normal">{line}</Text>
                ))}
            </Box>
        );
    };

    return <Stack>{data.map(chunkRender)}</Stack>;
};

export default TrackLyrics;

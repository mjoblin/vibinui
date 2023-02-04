import React, { FC } from "react";
import { Box, Flex, Stack, Text } from "@mantine/core";

import { LyricChunk, useGetLyricsQuery } from "../../app/services/vibinTracks";
import SadLabel from "../shared/SadLabel";
import SimpleLoader from "../shared/SimpleLoader";

type TrackLyricsProps = {
    trackId: string;
};

const TrackLyrics: FC<TrackLyricsProps> = ({ trackId }) => {
    const { data, error, isFetching } = useGetLyricsQuery(trackId);

    if (isFetching) {
        return <SimpleLoader label="Retrieving lyrics..." />;
    }

    if (!data || data.length <= 0) {
        return <SadLabel label="No lyrics found." />;
    }

    const chunkRender = (chunk: LyricChunk, chunkIndex: number) => {
        return (
            <Box key={`chunk_${chunkIndex}`}>
                {chunk.header && <Text weight="bold">{chunk.header}</Text>}
                {chunk.body.map((line, lineIndex) => (
                    <Text key={`line_${chunkIndex}_${lineIndex}`} weight="normal">
                        {line}
                    </Text>
                ))}
            </Box>
        );
    };

    return <Stack>{data.map(chunkRender)}</Stack>;
};

export default TrackLyrics;

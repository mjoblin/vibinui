import React, { FC, useEffect, useState } from "react";
import { Box, Button, Center, createStyles, Flex, Highlight, Stack, Text } from "@mantine/core";

import {
    LyricChunk,
    useLazyGetLyricsQuery,
    useLazyValidateLyricsQuery,
} from "../../app/services/vibinTracks";
import LoadingDataMessage from "../shared/LoadingDataMessage";
import SadLabel from "../shared/SadLabel";
import { getTextWidth } from "../../app/utils";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

// TODO: This component should take a track, but the current_track in Redux doesn't contain the
//  trackId. So instead the component expects *either* a trackId *or* artist and title.

type TrackLyricsProps = {
    trackId?: string;
    artist?: string;
    title?: string;
};

const TrackLyrics: FC<TrackLyricsProps> = ({ trackId, artist, title }) => {
    const { APP_ALT_FONTFACE } = useAppConstants();
    const [maxLineWidth, setMaxLineWidth] = useState<number>(0);
    const [showInvalidLyrics, setShowInvalidLyrics] = useState<boolean>(false);
    const { lyricsSearchText } = useAppSelector((state: RootState) => state.userSettings.tracks);
    const [validateLyrics, validateLyricsStatus] = useLazyValidateLyricsQuery();
    const [getLyrics, getLyricsStatus] = useLazyGetLyricsQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        lyricsContainer: {
            columnCount: "auto",
            columnWidth: maxLineWidth,
            columnFill: "balance",
        },
        chunkHeader: {
            fontFamily: APP_ALT_FONTFACE,
            fontWeight: "bold",
        },
        chunkBody: {
            fontFamily: APP_ALT_FONTFACE,
            color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.dark[5],
        },
    }))();

    useEffect(() => {
        getLyrics({ trackId, artist, title });
    }, []);

    /**
     * Calculate the maximum line length, which will be used to set the column width. This means
     * that all columns will be the width of the widest line (regardless of column), which isn't
     * ideal -- especially if there's one very long line relative to the others.
     *
     * TODO: Investigate ways to render multiple columns while making better use of the available
     *  space.
     */
    useEffect(() => {
        if (!getLyricsStatus.data) {
            return;
        }

        const allLineWidths = getLyricsStatus.data.chunks
            .map((chunk) => [
                getTextWidth(chunk.header || ""),
                ...chunk.body.map((line) => getTextWidth(line)),
            ])
            .flat(1);

        setMaxLineWidth(Math.max(...allLineWidths));
    }, [getLyricsStatus.data]);

    if (getLyricsStatus.isFetching || getLyricsStatus.isLoading) {
        return <LoadingDataMessage message="Retrieving lyrics..." />;
    }

    if (!getLyricsStatus.data || getLyricsStatus.data.chunks.length <= 0) {
        return <SadLabel label="No lyrics found" />;
    }

    if (!getLyricsStatus.data.is_valid && !showInvalidLyrics) {
        return (
            <Center>
                <Stack align="center">
                    <Text size="sm" weight="bold" transform="uppercase">
                        Lyrics marked as invalid
                    </Text>
                    <Button
                        compact
                        variant="light"
                        size="xs"
                        w="7rem"
                        onClick={() => setShowInvalidLyrics(true)}
                    >
                        Show Anyway
                    </Button>
                </Stack>
            </Center>
        );
    }

    /**
     * Render a single chunk. A chunk is usually a single verse, chorus, etc, but can sometimes be
     * something like "(Instrumental break)". Headers (if present) are rendered in bold, whereas
     * the body is rendered as normal text.
     */
    const chunkRender = (chunk: LyricChunk, chunkIndex: number) => {
        return (
            <Box key={`chunk_${chunkIndex}`}>
                {chunk.header && (
                    <Highlight className={dynamicClasses.chunkHeader} highlight={lyricsSearchText}>
                        {chunk.header}
                    </Highlight>
                )}

                <Box pb={15}>
                    {chunk.body.map((line, lineIndex) => (
                        <Highlight
                            key={`line_${chunkIndex}_${lineIndex}`}
                            className={dynamicClasses.chunkBody}
                            highlight={lyricsSearchText}
                        >
                            {line}
                        </Highlight>
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <Stack>
            <Flex gap={10}>
                {/* Mark as Valid/Invalid */}
                <Button
                    compact
                    variant="light"
                    size="xs"
                    w="7rem"
                    onClick={() =>
                        getLyricsStatus.data?.is_valid !== undefined &&
                        validateLyrics({
                            trackId,
                            artist,
                            title,
                            isValid: !getLyricsStatus.data.is_valid,
                        }).then(() => getLyrics({ trackId, artist, title }))
                    }
                >
                    {`Mark as ${getLyricsStatus.data.is_valid ? "Invalid" : "Valid"}`}
                </Button>

                {/* Refresh from Genius */}
                <Button
                    compact
                    variant="light"
                    size="xs"
                    w="10rem"
                    onClick={() => getLyrics({ trackId, artist, title, updateCache: true })}
                >
                    Refresh from Genius
                </Button>
            </Flex>
            <Box className={dynamicClasses.lyricsContainer}>
                {getLyricsStatus.data.chunks.map(chunkRender)}
            </Box>
        </Stack>
    );
};

export default TrackLyrics;

import React, { FC, useEffect, useState } from "react";
import { Box, createStyles, Highlight } from "@mantine/core";

import { LyricChunk, useGetLyricsQuery } from "../../app/services/vibinTracks";
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
    const { lyricsSearchText } = useAppSelector((state: RootState) => state.userSettings.tracks);
    const { data, error, isFetching } = useGetLyricsQuery({ trackId, artist, title });

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

    /**
     * Calculate the maximum line length, which will be used to set the column width. This means
     * that all columns will be the width of the widest line (regardless of column), which isn't
     * ideal -- especially if there's one very long line relative to the others.
     *
     * TODO: Investigate ways to render multiple columns while making better use of the available
     *  space.
     */
    useEffect(() => {
        if (!data) {
            return;
        }

        const allLineWidths = data
            .map((chunk) => [
                getTextWidth(chunk.header || ""),
                ...chunk.body.map((line) => getTextWidth(line)),
            ])
            .flat(1);

        setMaxLineWidth(Math.max(...allLineWidths));
    }, [data]);

    if (isFetching) {
        return <LoadingDataMessage message="Retrieving lyrics..." />;
    }

    if (!data || data.length <= 0) {
        return <SadLabel label="No lyrics found" />;
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

    return <Box className={dynamicClasses.lyricsContainer}>{data.map(chunkRender)}</Box>;
};

export default TrackLyrics;

import React, { FC } from "react";
import { Badge, Flex, Image, Text } from "@mantine/core";

import type { Format } from "../../app/types";
import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import Playhead from "./Playhead";

/**
 * Return a string describing the provided encoding format.
 *
 * @param format
 */
const codecDisplay = (format: Format): string => {
    const bitDepth = format.bit_depth;

    // First defer to a predefined "encoding" field.
    if (format.encoding) {
        return format.encoding;
    }

    // Attempt to build an encoding string from codec, sample_rate, and (optional) bit_depth.
    if (format.codec && format.sample_rate) {
        return `${format.sample_rate / 1000}kHz${bitDepth ? `/${bitDepth}bit` : ""} ${
            format.codec
        }`;
    }

    // Fall back on just returning a codec field if there is one.
    if (format.codec) {
        return format.codec;
    }

    // Return a printable empty string.
    return "\u00A0";
};

const NowPlaying: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentFormat = useAppSelector((state: RootState) => state.playback.current_format);

    // TODO: Probably want to make this nicer overall.
    if (!currentTrack) {
        return <Text>No Track</Text>;
    }

    return (
        <Flex direction="row" gap={10} align="center">
            <Flex direction="column" gap={5} align="flex-end">
                <Playhead />

                <Flex justify="space-between" sx={{ width: "100%" }}>
                    <Flex gap={3}>
                        {currentFormat?.lossless && (
                            <Badge size="xs" variant="light" styles={{ root: { fontSize: 7 } }}>
                                lossless
                            </Badge>
                        )}

                        {/* TODO: What does .mqa look like for mqa tracks? Should more information be displayed? */}
                        {currentFormat?.mqa !== "none" && (
                            <Badge size="xs" variant="light" styles={{ root: { fontSize: 7 } }}>
                                mqa
                            </Badge>
                        )}
                    </Flex>

                    {/* TODO: Change hardcoded rgb value to an app-defined theme color */}
                    <Text size="xs" pt={2} color="#717171" sx={{ lineHeight: 1.25, fontSize: 10 }}>
                        {currentFormat ? codecDisplay(currentFormat) : "unknown codec"}
                    </Text>
                </Flex>
            </Flex>

            <Flex direction="row" align="center" gap={10}>
                {/* TODO: Make this look nicer when there's no image to display */}
                {/* TODO: Consider replacing with <AlbumArt> */}
                <Image
                    src={currentTrack.art_url}
                    radius="sm"
                    width={35}
                    height={35}
                    fit="scale-down"
                />
                <Flex direction="column" align="start">
                    <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
                        {currentTrack.title}
                    </Text>
                    <Text size="xs" sx={{ lineHeight: 1.25 }}>
                        {currentTrack.artist} - {currentTrack.album}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default NowPlaying;

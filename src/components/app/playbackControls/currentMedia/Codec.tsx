import React, { FC } from "react";
import { Text } from "@mantine/core";

import { Format } from "../../../../app/types";

// ================================================================================================
// Codec string, e.g. "44.1kHz/16bit FLAC".
// ================================================================================================

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

type CodecProps = {
    format: Format;
};

const Codec: FC<CodecProps> = ({ format }) => {
    return (
        <Text size="xs" pt={2} color="#717171" sx={{ lineHeight: 1.25, fontSize: 10 }}>
            {format ? codecDisplay(format) : "unknown codec"}
        </Text>
    );
};

export default Codec;

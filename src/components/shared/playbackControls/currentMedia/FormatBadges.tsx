import React, { FC } from "react";
import { Badge, Flex } from "@mantine/core";

import { Format } from "../../../../app/types";

// ================================================================================================
// Media format badges (e.g. "LOSSLESS").
// ================================================================================================

type FormatBadgesProps = {
    format: Format;
};

const FormatBadges: FC<FormatBadgesProps> = ({ format }) => {
    return (
        <Flex gap={3}>
            {format?.lossless && (
                <Badge size="xs" variant="light" styles={{ root: { fontSize: 7 } }}>
                    lossless
                </Badge>
            )}

            {/* TODO: What does .mqa look like for mqa tracks? Should more information be displayed? */}
            {format?.mqa !== "none" && (
                <Badge size="xs" variant="light" styles={{ root: { fontSize: 7 } }}>
                    mqa
                </Badge>
            )}
        </Flex>
    );
};

export default FormatBadges;

import React from "react";
import { Flex, Text, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

import MediaSourceBadge from "../../shared/dataDisplay/MediaSourceBadge";

// ================================================================================================
// Banner explaining when the streamer's active Playlist is not being used for playback, due to
// another active media source being used.
// ================================================================================================

const PlaylistInactiveBanner = React.forwardRef((props, ref) => {
    const { colors } = useMantineTheme();

    return (
        // @ts-ignore
        <Flex ref={ref} align="center" justify="center" gap={10} bg="#444411" p={15} mb={10}>
            <IconAlertCircle size={20} color={colors.yellow[4]} />
            <Text>Playlist is currently not being used for playback. Active streamer source is </Text>
            <MediaSourceBadge showSource={true} />
        </Flex>
    );
});

export default PlaylistInactiveBanner;

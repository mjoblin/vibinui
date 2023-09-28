import React, { FC } from "react";
import { Flex, Text } from "@mantine/core";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import MediaArt from "../mediaDisplay/MediaArt";

// ================================================================================================
// Details about the currently-playing media.
//
// Contents:
//  - Media art.
//  - Currently-playing title.
//  - Currently-playing artist.
// ================================================================================================

const CurrentMediaDetails: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);

    // TODO: Consider what to render when there's nothing playing
    if (playStatus === "not_ready" || !currentTrack) {
        return null;
    }

    return (
        <Flex direction="row" align="center" gap={10} sx={{ flexGrow: 1, minWidth: 0 }}>
            <MediaArt
                artUri={currentTrack.art_url}
                size={35}
                fit="scale-down"
                showControls={false}
            />

            <Flex
                direction="column"
                align="start"
                sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden" }}
            >
                <Text
                    size="xs"
                    weight="bold"
                    sx={{
                        lineHeight: 1.25,
                        maxWidth: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {currentTrack.title}
                </Text>
                <Text
                    size="xs"
                    sx={{
                        lineHeight: 1.25,
                        maxWidth: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {currentTrack.artist}
                    {currentTrack.album && ` - ${currentTrack.album}`}
                </Text>
            </Flex>
        </Flex>
    );
};

export default CurrentMediaDetails;

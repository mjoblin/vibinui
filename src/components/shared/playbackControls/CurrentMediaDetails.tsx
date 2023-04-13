import React, { FC } from "react";
import { Box, Center, Flex, Image, Text, useMantineTheme } from "@mantine/core";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";

// ================================================================================================
// Details about the currently-playing media.
//
// Contents:
//  - Media art.
//  - Currently-playing title.
//  - Currently-playing artist.
// ================================================================================================

const CurrentMediaDetails: FC = () => {
    const { colors } = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);

    // TODO: Consider what to render when there's nothing playing
    if (playStatus === "not_ready" || !currentTrack) {
        return null;
    }

    return (
        <Flex direction="row" align="center" gap={10} sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* TODO: Consider replacing with <AlbumArt> */}
            <Image
                src={currentTrack.art_url}
                radius="sm"
                width={35}
                height={35}
                fit="scale-down"
                withPlaceholder={true}
                placeholder={
                    <Box w="100%" h="100%" bg={colors.dark[5]}>
                        <Center w="100%" h="100%">
                            <Text transform="uppercase" weight="bold" size={6}>
                                no art
                            </Text>
                        </Center>
                    </Box>
                }
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

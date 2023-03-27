import React, { FC } from "react";
import { Box, Center, Flex, Image, Text, useMantineTheme } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import Codec from "./Codec";
import FormatBadges from "./FormatBadges";
import Playhead from "./Playhead";

type NowPlayingProps = {
    showAlbumDetails?: boolean;
    playheadWidth?: number;
};

// TODO: Rename this component. It clashes with <NowPlayingScreen>.

const NowPlaying: FC<NowPlayingProps> = ({ showAlbumDetails = true, playheadWidth }) => {
    const { colors } = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentFormat = useAppSelector((state: RootState) => state.playback.current_format);

    // TODO: Consider what to render when there's nothing playing
    if (playStatus === "not_ready" || !currentTrack) {
        return null;
    }

    return (
        <Flex direction="row" gap={10} align="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Flex
                direction="column"
                gap={5}
                align="stretch"
                sx={{
                    flexGrow: 1,
                    minWidth: playheadWidth ? playheadWidth : undefined,
                    maxWidth: playheadWidth ? playheadWidth : undefined,
                }}
            >
                <Playhead />

                {currentFormat && (
                    <Flex justify="space-between" sx={{ width: "100%" }}>
                        <FormatBadges format={currentFormat} />
                        <Codec format={currentFormat} />
                    </Flex>
                )}
            </Flex>

            {showAlbumDetails && (
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
            )}
        </Flex>
    );
};

export default NowPlaying;

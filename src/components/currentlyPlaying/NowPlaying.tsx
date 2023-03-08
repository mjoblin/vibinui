import React, { FC } from "react";
import { Box, Center, Flex, Image, Notification, Text, useMantineTheme } from "@mantine/core";

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
    const playback = useAppSelector((state: RootState) => state.playback);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentFormat = useAppSelector((state: RootState) => state.playback.current_format);

    // TODO: Consider what to render when there's nothing playing
    if (playback.play_status === "not_ready" || !currentTrack) {
        return null;
    }

    return (
        <Flex direction="row" gap={10} align="center" sx={{ flexGrow: 1 }}>
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
                <Flex direction="row" align="center" gap={10}>
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
                    <Flex direction="column" align="start">
                        <Text size="xs" weight="bold" sx={{ lineHeight: 1.25 }}>
                            {currentTrack.title}
                        </Text>
                        <Text size="xs" sx={{ lineHeight: 1.25 }}>
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

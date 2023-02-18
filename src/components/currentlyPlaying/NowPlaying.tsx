import React, { FC } from "react";
import { Flex, Image, Notification, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import Codec from "./Codec";
import FormatBadges from "./FormatBadges";
import Playhead from "./Playhead";

type NowPlayingProps = {
    showAlbumDetails?: boolean;
    maxPlayheadWidth?: number;
};

// TODO: Rename this component. It clashes with <NowPlayingScreen>.

const NowPlaying: FC<NowPlayingProps> = ({ showAlbumDetails = true, maxPlayheadWidth }) => {
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
                sx={{ flexGrow: 1, maxWidth: maxPlayheadWidth ? maxPlayheadWidth : undefined }}
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
                            {currentTrack.artist}{currentTrack.album && ` - ${currentTrack.album}`}
                        </Text>
                    </Flex>
                </Flex>
            )}
        </Flex>
    );
};

export default NowPlaying;

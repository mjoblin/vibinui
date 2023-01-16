import React, { FC } from "react";
import { Flex, Image, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import Playhead from "./Playhead";

const CurrentlyPlaying: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentFormat = useAppSelector((state: RootState) => state.playback.current_format);

    if (!currentTrack) {
        return <Text>No Track</Text>;
    }

    return (
        <Flex direction="row" gap={10} align="center">
            <Flex direction="column" gap={5} align="flex-end">
                <Playhead />

                {/* TODO: Change hardcoded rgb value to an app-defined theme color */}
                <Text size="xs" color="#717171" sx={{ lineHeight: 1.25, fontSize: 10 }}>
                    {currentFormat?.encoding || "unknown encoding"}
                </Text>
            </Flex>

            {/*<Paper radius="sm" sx={{ padding: 5, backgroundColor: "#25262b" }} withBorder>*/}
            {/*<Paper radius="sm" sx={{ padding: 5 }} withBorder>*/}
                <Flex direction="row" align="center" gap={10}>
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
            {/*</Paper>*/}
        </Flex>
    );
};

export default CurrentlyPlaying;

import React, { FC } from "react";
import { Flex } from "@mantine/core";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/useInterval";
import Codec from "./currentMedia/Codec";
import FormatBadges from "./currentMedia/FormatBadges";
import Playhead from "./currentMedia/Playhead";

type CurrentMediaControlsProps = {
    playheadWidth?: number;
};

const CurrentMediaControls: FC<CurrentMediaControlsProps> = ({ playheadWidth }) => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const currentFormat = useAppSelector((state: RootState) => state.playback.current_format);

    // TODO: Consider what to render when there's nothing playing
    if (playStatus === "not_ready" || !currentTrack) {
        return null;
    }

    return (
        <Flex
            direction="row"
            align="center"
            sx={{
                minWidth: playheadWidth ? playheadWidth : undefined,
                maxWidth: playheadWidth ? playheadWidth : undefined,
            }}
        >
            <Flex direction="column" gap={5} align="stretch" sx={{ flexGrow: 1 }}>
                <Playhead />

                {currentFormat && (
                    <Flex justify="space-between" sx={{ width: "100%" }}>
                        <FormatBadges format={currentFormat} />
                        <Codec format={currentFormat} />
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};

export default CurrentMediaControls;

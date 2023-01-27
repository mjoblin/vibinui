import React, { FC } from "react";
import { Center, RingProgress, Text } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { secstoHms } from "../../app/utils";

const PlayheadRing: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const playhead = useAppSelector((state: RootState) => state.playback.playhead);

    return (
        <RingProgress
            size={100}
            roundCaps
            thickness={8}
            sections={
                currentTrack ? [{ value: playhead.position_normalized * 100, color: "blue" }] : []
            }
            label={
                <Center>
                    <Text size="sm">
                        {currentTrack && `${Math.round(playhead.position_normalized * 100)}%`}
                    </Text>
                </Center>
            }
            sx={{
                overflowY: "hidden",
            }}
        />
    );
};

export default PlayheadRing;

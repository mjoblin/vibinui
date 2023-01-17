import React, { FC } from "react";
import { Group } from "@mantine/core";
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
} from "@tabler/icons";

import {
    useNextTrackMutation,
    usePauseMutation,
    usePlayMutation,
    usePreviousTrackMutation,
} from "../../app/services/vibinTransport";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

const TransportControls: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const [nextTrack] = useNextTrackMutation();
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [previousTrack] = usePreviousTrackMutation();

    // TODO: Give some hover feedback (perhaps lighten the icon background).
    // TODO: Make the default color a little lighter (pure white is too bright).
    // TODO: Think about when prev/next should be disabled.

    return (
        <Group spacing="sm">
            <IconPlayerTrackPrev
                size={20}
                stroke={1}
                fill="white"
                onClick={() => previousTrack()}
            />

            {!playStatus ? (
                <IconPlayerPlay size={20} stroke={1} fill={"grey"} color="grey" />
            ) : ["play", "buffering"].includes(playStatus) ? (
                playStatus === "play" ? (
                    <IconPlayerPause
                        size={20}
                        stroke={1}
                        fill={"white"}
                        onClick={() => pausePlayback()}
                    />
                ) : (
                    <IconPlayerPause size={20} stroke={1} color="grey" fill="grey" />
                )
            ) : ["pause", "ready"].includes(playStatus) ? (
                playStatus === "pause" ? (
                    <IconPlayerPlay
                        size={20}
                        stroke={1}
                        fill="white"
                        onClick={() => resumePlayback()}
                    />
                ) : (
                    <IconPlayerPlay size={20} stroke={1} color="grey" fill="grey" />
                )
            ) : (
                <IconPlayerPlay size={20} stroke={1} color="grey" fill={"white"} />
            )}

            <IconPlayerTrackNext size={20} stroke={1} fill={"white"} onClick={() => nextTrack()} />
        </Group>
    );
};

export default TransportControls;

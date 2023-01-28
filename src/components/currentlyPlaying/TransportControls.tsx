import React, { FC } from "react";
import { createStyles, Flex } from "@mantine/core";
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
import VibinIconButton from "../shared/VibinIconButton";

const useStyles = createStyles((theme) => ({
    transportControl: {
        opacity: 0.7,
        transition: "transform .2s ease-in-out, opacity .2s ease-in-out",
        "&:hover": {
            cursor: "pointer",
            opacity: 1,
        },
    },
}));

const TransportControls: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const [nextTrack] = useNextTrackMutation();
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const { classes } = useStyles();

    // TODO: Think about when prev/next should be disabled.
    // TODO: Switch IconPlayerPlay and IconPlayerPause to VibinIconButton.

    return (
        <Flex gap="sm">
            <VibinIconButton
                icon={IconPlayerTrackPrev}
                size={20}
                container={false}
                fill={true}
                onClick={() => previousTrack()}
            />

            {!playStatus ? (
                <IconPlayerPlay size={20} stroke={1} fill={"grey"} color="grey" />
            ) : ["play", "buffering"].includes(playStatus) ? (
                playStatus === "play" ? (
                    <IconPlayerPause
                        className={classes.transportControl}
                        size={20}
                        stroke={1}
                        color="white"
                        fill="white"
                        onClick={() => pausePlayback()}
                    />
                ) : (
                    <IconPlayerPause
                        className={classes.transportControl}
                        size={20}
                        stroke={1}
                        color="grey"
                        fill="grey"
                    />
                )
            ) : ["pause", "ready"].includes(playStatus) ? (
                playStatus === "pause" ? (
                    <IconPlayerPlay
                        className={classes.transportControl}
                        size={20}
                        stroke={1}
                        color="white"
                        fill="white"
                        onClick={() => resumePlayback()}
                    />
                ) : (
                    <IconPlayerPlay
                        className={classes.transportControl}
                        size={20}
                        stroke={1}
                        color="grey"
                        fill="grey"
                    />
                )
            ) : (
                <IconPlayerPlay
                    className={classes.transportControl}
                    size={20}
                    stroke={1}
                    color="grey"
                    fill="white"
                />
            )}

            <VibinIconButton
                icon={IconPlayerTrackNext}
                size={20}
                container={false}
                fill={true}
                onClick={() => nextTrack()}
            />
        </Flex>
    );
};

export default TransportControls;

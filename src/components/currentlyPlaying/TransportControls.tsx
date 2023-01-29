import React, { FC } from "react";
import { createStyles, Flex, Stack, useMantineTheme } from "@mantine/core";
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconRepeat,
    IconArrowsShuffle,
} from "@tabler/icons";

import {
    useNextTrackMutation,
    usePauseMutation,
    usePlayMutation,
    usePreviousTrackMutation,
    useToggleRepeatMutation,
    useToggleShuffleMutation,
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
    const repeatState = useAppSelector((state: RootState) => state.playback.repeat);
    const shuffleState = useAppSelector((state: RootState) => state.playback.shuffle);
    const [nextTrack] = useNextTrackMutation();
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [toggleRepeat] = useToggleRepeatMutation();
    const [toggleShuffle] = useToggleShuffleMutation();
    const theme = useMantineTheme();
    const { classes } = useStyles();

    // TODO: Think about when prev/next should be disabled.
    // TODO: Switch IconPlayerPlay and IconPlayerPause to VibinIconButton.

    return (
        <Flex gap="xs" align="center">
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

            <Stack spacing={5}>
                <VibinIconButton
                    icon={IconRepeat}
                    size={12}
                    stroke={2}
                    container={false}
                    color={repeatState === "all" ? theme.colors.blue[5] : theme.colors.gray[6]}
                    hoverColor={repeatState === "all" ? theme.colors.blue[2] : undefined}
                    onClick={() => toggleRepeat()}
                />

                <VibinIconButton
                    icon={IconArrowsShuffle}
                    size={12}
                    stroke={2}
                    container={false}
                    color={shuffleState === "all" ? theme.colors.blue[5] : theme.colors.gray[6]}
                    hoverColor={shuffleState === "all" ? theme.colors.blue[2] : undefined}
                    onClick={() => toggleShuffle()}
                />
            </Stack>
        </Flex>
    );
};

export default TransportControls;

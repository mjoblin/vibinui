import React, { FC } from "react";
import { ActionIcon, Flex, Stack, useMantineTheme } from "@mantine/core";
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
import { TransportAction } from "../../app/store/playbackSlice";

const TransportControls: FC = () => {
    const { colors } = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const activeTransportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );
    const repeatState = useAppSelector((state: RootState) => state.playback.repeat);
    const shuffleState = useAppSelector((state: RootState) => state.playback.shuffle);
    const [nextTrack] = useNextTrackMutation();
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [toggleRepeat] = useToggleRepeatMutation();
    const [toggleShuffle] = useToggleShuffleMutation();

    const disabledStyles = {
        "&[data-disabled]": {
            backgroundColor: "rgb(0, 0, 0, 0)",
            opacity: 0.4,
            border: "none",
        },
    };

    const colorStandard = colors.dark[1];
    const colorActive = colors.blue[5];

    return (
        <Flex gap={3} align="center">
            {/* Previous */}
            <ActionIcon
                disabled={!activeTransportActions.includes("previous")}
                sx={disabledStyles}
                onClick={() => previousTrack()}
            >
                <IconPlayerTrackPrev
                    size={20}
                    stroke={1}
                    color={colorStandard}
                    fill={colorStandard}
                />
            </ActionIcon>

            {/* Play/Pause */}
            {playStatus === "play" ? (
                <ActionIcon
                    disabled={
                        !activeTransportActions.includes("pause") &&
                        !activeTransportActions.includes("stop")
                    }
                    sx={disabledStyles}
                    onClick={() => pausePlayback()}
                >
                    <IconPlayerPause
                        size={20}
                        stroke={1}
                        color={colorStandard}
                        fill={colorStandard}
                    />
                </ActionIcon>
            ) : (
                <ActionIcon
                    disabled={!activeTransportActions.includes("play")}
                    sx={disabledStyles}
                    onClick={() => resumePlayback()}
                >
                    <IconPlayerPlay
                        size={20}
                        stroke={1}
                        color={colorStandard}
                        fill={colorStandard}
                    />
                </ActionIcon>
            )}

            {/* Next */}
            <ActionIcon
                disabled={!activeTransportActions.includes("next")}
                sx={disabledStyles}
                onClick={() => nextTrack()}
            >
                <IconPlayerTrackNext
                    size={20}
                    stroke={1}
                    color={colorStandard}
                    fill={colorStandard}
                />
            </ActionIcon>

            {/* Repeat/Shuffle */}
            <Stack spacing={0}>
                <ActionIcon
                    disabled={!activeTransportActions.includes("repeat")}
                    mih={20}
                    miw={20}
                    mah={20}
                    maw={20}
                    sx={disabledStyles}
                    onClick={() => toggleRepeat()}
                >
                    <IconRepeat
                        size={12}
                        stroke={2}
                        color={repeatState === "all" ? colorActive : colorStandard}
                    />
                </ActionIcon>

                <ActionIcon
                    disabled={!activeTransportActions.includes("shuffle")}
                    mih={20}
                    miw={20}
                    mah={20}
                    maw={20}
                    sx={disabledStyles}
                    onClick={() => toggleShuffle()}
                >
                    <IconArrowsShuffle
                        size={12}
                        stroke={2}
                        color={shuffleState === "all" ? colorActive : colorStandard}
                    />
                </ActionIcon>
            </Stack>
        </Flex>
    );
};

export default TransportControls;

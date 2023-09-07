import React, { FC } from "react";
import { ActionIcon, Flex, Stack, useMantineTheme } from "@mantine/core";
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerStop,
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
    useStopMutation,
    useToggleRepeatMutation,
    useToggleShuffleMutation,
} from "../../../app/services/vibinTransport";
import { useLazyPlayPresetIdQuery } from "../../../app/services/vibinPresets";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";

// ================================================================================================
// Transport controls.
//
// Contents:
//  - Previous Track.
//  - Play/Pause/Stop.
//  - Next Track.
//  - Repeat.
//  - Shuffle.
//
// Note: The streamer might support a few approaches to stopping/starting playback. See the
//  TransportActions type definition for details.
// ================================================================================================

const TransportControls: FC = () => {
    const theme = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const activeTransportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );
    const presets = useAppSelector((state: RootState) => state.presets.presets);
    const repeatState = useAppSelector((state: RootState) => state.playback.repeat);
    const shuffleState = useAppSelector((state: RootState) => state.playback.shuffle);
    const currentStreamerSource = useAppSelector(
        (state: RootState) => state.system.streamer.sources?.active
    );
    const [nextTrack] = useNextTrackMutation();
    const [pausePlayback] = usePauseMutation();
    const [playPlayback] = usePlayMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [stopPlayback] = useStopMutation();
    const [toggleRepeat] = useToggleRepeatMutation();
    const [toggleShuffle] = useToggleShuffleMutation();
    const [playPresetId] = useLazyPlayPresetIdQuery();

    const disabledStyles = {
        "&[data-disabled]": {
            backgroundColor: "rgb(0, 0, 0, 0)",
            opacity: 0.4,
            border: "none",
        },
    };

    const colorStandard = theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.dark[3];
    const colorActive = theme.colorScheme === "dark" ? theme.colors.blue[5] : theme.colors.blue[8];

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

            {/* Play/Pause/Toggle/Stop */}
            {playStatus === "play" ? (
                <ActionIcon
                    disabled={
                        !activeTransportActions.includes("toggle_playback") &&
                        !activeTransportActions.includes("pause") &&
                        !activeTransportActions.includes("stop")
                    }
                    sx={disabledStyles}
                    onClick={() =>
                        activeTransportActions.includes("toggle_playback") ||
                        activeTransportActions.includes("pause")
                            ? pausePlayback()
                            : stopPlayback()
                    }
                >
                    {activeTransportActions.includes("toggle_playback") ||
                    activeTransportActions.includes("pause") ? (
                        <IconPlayerPause
                            size={20}
                            stroke={1}
                            color={colorStandard}
                            fill={colorStandard}
                        />
                    ) : (
                        <IconPlayerStop
                            size={20}
                            stroke={1}
                            color={colorStandard}
                            fill={colorStandard}
                        />
                    )}
                </ActionIcon>
            ) : (
                <ActionIcon
                    disabled={
                        !activeTransportActions.includes("toggle_playback") &&
                        !activeTransportActions.includes("play")
                    }
                    sx={disabledStyles}
                    onClick={() => {
                        if (currentStreamerSource?.class === "stream.radio") {
                            const active_preset = presets.find((preset) => preset.is_playing);
                            active_preset && playPresetId(active_preset.id);
                        } else {
                            playPlayback();
                        }
                    }}
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

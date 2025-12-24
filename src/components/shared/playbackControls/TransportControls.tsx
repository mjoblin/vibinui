import React, { FC } from "react";
import { ActionIcon, Flex, Stack, useMantineTheme } from "@mantine/core";
import {
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerStop,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconRepeat,
    IconRepeatOnce,
    IconArrowsShuffle,
} from "@tabler/icons-react";

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
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
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
    const { HEADER_ICON_SIZE, STYLE_DISABLEABLE } = useAppGlobals();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const activeTransportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions,
    );
    const presets = useAppSelector((state: RootState) => state.presets.presets);
    const repeatState = useAppSelector((state: RootState) => state.playback.repeat);
    const shuffleState = useAppSelector((state: RootState) => state.playback.shuffle);
    const currentStreamerSource = useAppSelector(
        (state: RootState) => state.system.streamer.sources?.active,
    );
    const [nextTrack] = useNextTrackMutation();
    const [pausePlayback] = usePauseMutation();
    const [playPlayback] = usePlayMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [stopPlayback] = useStopMutation();
    const [toggleRepeat] = useToggleRepeatMutation();
    const [toggleShuffle] = useToggleShuffleMutation();
    const [playPresetId] = useLazyPlayPresetIdQuery();

    const colorStandard =
        theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.dark[3];
    const colorActive = theme.colorScheme === "dark" ? theme.colors.blue[5] : theme.colors.blue[8];

    return (
        <Flex gap={3} align="center">
            {/* Previous */}
            <ActionIcon
                disabled={!activeTransportActions.includes("previous")}
                sx={STYLE_DISABLEABLE}
                onClick={() => previousTrack()}
            >
                <IconPlayerTrackPrev
                    size={HEADER_ICON_SIZE}
                    stroke={1}
                    color={colorStandard}
                    fill={colorStandard}
                />
            </ActionIcon>

            {/* Play/Pause/Toggle/Stop */}
            {playStatus === "play" ? (
                // Pause or Stop
                <ActionIcon
                    disabled={
                        !activeTransportActions.includes("toggle_playback") &&
                        !activeTransportActions.includes("pause") &&
                        !activeTransportActions.includes("stop")
                    }
                    sx={STYLE_DISABLEABLE}
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
                            size={HEADER_ICON_SIZE}
                            stroke={1}
                            color={colorStandard}
                            fill={colorStandard}
                        />
                    ) : (
                        <IconPlayerStop
                            size={HEADER_ICON_SIZE}
                            stroke={1}
                            color={colorStandard}
                            fill={colorStandard}
                        />
                    )}
                </ActionIcon>
            ) : (
                // Play/resume
                <ActionIcon
                    disabled={
                        !activeTransportActions.includes("toggle_playback") &&
                        !activeTransportActions.includes("play")
                    }
                    sx={STYLE_DISABLEABLE}
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
                        size={HEADER_ICON_SIZE}
                        stroke={1}
                        color={colorStandard}
                        fill={colorStandard}
                    />
                </ActionIcon>
            )}

            {/* Next */}
            <ActionIcon
                disabled={!activeTransportActions.includes("next")}
                sx={STYLE_DISABLEABLE}
                onClick={() => nextTrack()}
            >
                <IconPlayerTrackNext
                    size={HEADER_ICON_SIZE}
                    stroke={1}
                    color={colorStandard}
                    fill={colorStandard}
                />
            </ActionIcon>

            {/* Repeat/Shuffle */}
            <Stack spacing={0}>
                <ActionIcon
                    disabled={!activeTransportActions.includes("repeat")}
                    mih={HEADER_ICON_SIZE}
                    miw={HEADER_ICON_SIZE}
                    mah={HEADER_ICON_SIZE}
                    maw={HEADER_ICON_SIZE}
                    sx={STYLE_DISABLEABLE}
                    onClick={() => toggleRepeat()}
                >
                    {repeatState === "one" ? (
                        <IconRepeatOnce
                            size={12}
                            stroke={2}
                            color={colorActive}
                        />
                    ) : (
                        <IconRepeat
                            size={12}
                            stroke={2}
                            color={repeatState === "all" ? colorActive : colorStandard}
                        />
                    )}
                </ActionIcon>

                <ActionIcon
                    disabled={!activeTransportActions.includes("shuffle")}
                    mih={HEADER_ICON_SIZE}
                    miw={HEADER_ICON_SIZE}
                    mah={HEADER_ICON_SIZE}
                    maw={HEADER_ICON_SIZE}
                    sx={STYLE_DISABLEABLE}
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

import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Modal, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useAmplifierMuteToggleMutation,
    useAmplifierVolumeDownMutation,
    useAmplifierVolumeSetMutation,
    useAmplifierVolumeUpMutation,
} from "../../../app/services/vibinSystem";
import {
    useNextTrackMutation,
    usePauseMutation,
    usePlayMutation,
    usePreviousTrackMutation,
    useSeekMutation,
} from "../../../app/services/vibinTransport";
import FieldValueList from "../../shared/dataDisplay/FieldValueList";
import {
    setShowCurrentTrackLyrics,
    setShowKeyboardShortcuts,
} from "../../../app/store/internalSlice";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";

const SEEK_OFFSET_SECS = 10;

// ================================================================================================
// Manage the application-wide keyboard shortcuts. Listen for hotkey triggers, and display the
// information about the shortcuts when requested.
// ================================================================================================

const KeyboardShortcutsManager: FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { colors } = useMantineTheme();
    const { APP_MODAL_BLUR } = useAppGlobals();
    const { showKeyboardShortcuts } = useAppSelector(
        (state: RootState) => state.internal.application
    );
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const duration = useAppSelector((state: RootState) => state.playback.current_track?.duration);
    const position = useAppSelector((state: RootState) => state.playback.playhead.position);
    const amplifier = useAppSelector((state: RootState) => state.system.amplifier);
    const [volumeDown] = useAmplifierVolumeDownMutation();
    const [volumeUp] = useAmplifierVolumeUpMutation();
    const [volumeSet] = useAmplifierVolumeSetMutation();
    const [amplifierMuteToggle] = useAmplifierMuteToggleMutation();
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [nextTrack] = useNextTrackMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [seek] = useSeekMutation();
    const [localVolume, setLocalVolume] = useState<number | undefined>(undefined);

    useEffect(() => {
        amplifier?.volume && setLocalVolume(amplifier?.volume);
    }, [amplifier?.volume]);

    useHotkeys([
        ["J", () => seek(Math.max(position - SEEK_OFFSET_SECS, 0))],
        ["K", () => (playStatus === "play" ? pausePlayback() : resumePlayback())],
        ["L", () => duration && seek(Math.min(position + SEEK_OFFSET_SECS, duration))],
        ["ArrowLeft", () => previousTrack()],
        ["ArrowRight", () => nextTrack()],
        ["ArrowUp", () => volumeUp()],
        ["ArrowDown", () => volumeDown()],
        ["shift+ArrowUp", () => typeof localVolume === "number" && volumeSet(Math.min(localVolume + 0.05, 1.0))],
        ["shift+ArrowDown", () => typeof localVolume === "number" && volumeSet(Math.max(localVolume - 0.05, 0.0))],
        ["ctrl+shift+ArrowDown", () => amplifierMuteToggle()],
        ["C", () => navigate("/ui/current")],
        ["P", () => navigate("/ui/playlist")],
        ["R", () => navigate("/ui/artists")],
        ["A", () => navigate("/ui/albums")],
        ["T", () => navigate("/ui/tracks")],
        ["E", () => navigate("/ui/presets")],
        ["F", () => navigate("/ui/favorites")],
        ["shift+?", () => dispatch(setShowKeyboardShortcuts(!showKeyboardShortcuts))],
        ["shift+L", () => dispatch(setShowCurrentTrackLyrics(true))],
    ]);

    return showKeyboardShortcuts ? (
        <Modal
            opened={showKeyboardShortcuts}
            size="lg"
            centered
            title="Keyboard Shortcuts"
            overlayProps={{ blur: APP_MODAL_BLUR }}
            onClose={() => dispatch(setShowKeyboardShortcuts(false))}
        >
            <Stack spacing="md">
                <Flex gap="md" w="100%">
                    {/* Playhead -------------------------------------------------------------- */}
                    <Paper p="md" radius={5} withBorder  sx={{ flexGrow: 1 }}>
                        <Stack spacing="sm">
                            <Stack spacing={0}>
                                <Text weight="bold" transform="uppercase">
                                    Playback
                                </Text>
                                <Text fz="xs" c="dimmed">
                                    Control the streamer playhead
                                </Text>
                            </Stack>
                            <FieldValueList
                                fieldValues={{
                                    J: `Seek back ${SEEK_OFFSET_SECS} seconds`,
                                    K: "Play/Pause",
                                    L: `Seek forwards ${SEEK_OFFSET_SECS} seconds`,
                                    "←": "Previous track",
                                    "→": "Next track",
                                }}
                                columnGap={10}
                                keySize={16}
                                keyWeight="bold"
                                keyColor={colors.gray[1]}
                                valueSize={16}
                                valueWeight="normal"
                                valueColor={colors.gray[5]}
                            />
                        </Stack>
                    </Paper>

                    {/* Amplifier ------------------------------------------------------------- */}
                    <Paper p="md" radius={5} withBorder sx={{ flexGrow: 1 }}>
                        <Stack spacing="sm">
                            <Stack spacing={0}>
                                <Text weight="bold" transform="uppercase">
                                    Amplifier
                                </Text>
                                <Text fz="xs" c="dimmed">
                                    Control the amplifier
                                </Text>
                                {!amplifier &&
                                    <Text fz="xs" c="red">
                                        Requires an amplifier to be registered with Vibin
                                    </Text>
                                }
                            </Stack>
                            <FieldValueList
                                fieldValues={{
                                    "↑": "Volume up",
                                    "↓": "Volume down",
                                    "⇧↑": "Volume up 5 units",
                                    "⇧↓": "Volume down 5 units",
                                    "^⇧↓": "Toggle mute",
                                }}
                                columnGap={10}
                                keySize={16}
                                keyWeight="bold"
                                keyColor={colors.gray[1]}
                                valueSize={16}
                                valueWeight="normal"
                                valueColor={colors.gray[5]}
                            />
                        </Stack>
                    </Paper>
                </Flex>

                <Flex gap="md">
                    {/* Navigation ------------------------------------------------------------ */}
                    <Paper p="md" radius={5} withBorder sx={{ flexGrow: 1 }}>
                        <Stack spacing="sm">
                            <Stack spacing={0}>
                                <Text weight="bold" transform="uppercase">
                                    Navigation
                                </Text>
                                <Text fz="xs" c="dimmed">
                                    Switch between applications screens
                                </Text>
                            </Stack>
                            <FieldValueList
                                fieldValues={{
                                    C: "Current Track",
                                    P: "Playlist",
                                    R: "Artists",
                                    A: "Albums",
                                    T: "Tracks",
                                    E: "Presets",
                                    F: "Favorites",
                                }}
                                columnGap={10}
                                keySize={16}
                                keyWeight="bold"
                                keyColor={colors.gray[1]}
                                valueSize={16}
                                valueWeight="normal"
                                valueColor={colors.gray[5]}
                            />
                        </Stack>
                    </Paper>

                    {/* Additional ------------------------------------------------------------ */}
                    <Paper p="md" radius={5} withBorder sx={{ flexGrow: 1 }}>
                        <Stack spacing="sm">
                            <Stack spacing={0}>
                                <Text weight="bold" transform="uppercase">
                                    Additional
                                </Text>
                            </Stack>
                            <FieldValueList
                                fieldValues={{
                                    "?": "Show this Help screen",
                                    "⇧L": "Show the current track lyrics",
                                    "⇧D": "Show the Debug panel",
                                }}
                                columnGap={10}
                                keySize={16}
                                keyWeight="bold"
                                keyColor={colors.gray[1]}
                                valueSize={16}
                                valueWeight="normal"
                                valueColor={colors.gray[5]}
                            />
                        </Stack>
                    </Paper>
                </Flex>
            </Stack>
        </Modal>
    ) : null;
};

export default KeyboardShortcutsManager;

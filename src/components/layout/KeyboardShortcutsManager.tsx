import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    useNextTrackMutation,
    usePauseMutation,
    usePlayMutation,
    usePreviousTrackMutation,
    useSeekMutation,
} from "../../app/services/vibinTransport";
import FieldValueList from "../fieldValueList/FieldValueList";
import { setShowCurrentTrackLyrics, setShowKeyboardShortcuts } from "../../app/store/internalSlice";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";

const SEEK_OFFSET_SECS = 10;

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
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [nextTrack] = useNextTrackMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [seek] = useSeekMutation();

    useHotkeys([
        ["J", () => seek(Math.max(position - SEEK_OFFSET_SECS, 0))],
        ["K", () => (playStatus === "play" ? pausePlayback() : resumePlayback())],
        ["L", () => duration && seek(Math.min(position + SEEK_OFFSET_SECS, duration))],
        [",", () => previousTrack()],
        [".", () => nextTrack()],
        ["C", () => navigate("/ui/current")],
        ["P", () => navigate("/ui/playlist")],
        ["shift+?", () => dispatch(setShowKeyboardShortcuts(!showKeyboardShortcuts))],
        ["shift+L", () => dispatch(setShowCurrentTrackLyrics(true))],
    ]);

    return showKeyboardShortcuts ? (
        <Modal
            opened={showKeyboardShortcuts}
            centered
            title="Keyboard Shortcuts"
            overlayProps={{ blur: APP_MODAL_BLUR }}
            onClose={() => dispatch(setShowKeyboardShortcuts(false))}
        >
            <Stack spacing="md">
                <Paper p="md" radius={5} withBorder>
                    <Stack spacing="sm">
                        <Stack spacing={0}>
                            <Text weight="bold" transform="uppercase">
                                Playback
                            </Text>
                            <Text fz="xs" c="dimmed">
                                Control the playhead during playback
                            </Text>
                        </Stack>
                        <FieldValueList
                            fieldValues={{
                                j: `Seek back ${SEEK_OFFSET_SECS} seconds`,
                                k: "Play/Pause",
                                l: `Seek forwards ${SEEK_OFFSET_SECS} seconds`,
                                ",": "Previous track",
                                ".": "Next track",
                            }}
                            columnGap={10}
                            keyFontFamily="courier"
                            keySize={16}
                            keyWeight="bold"
                            keyColor={colors.gray[1]}
                            valueSize={16}
                            valueWeight="normal"
                            valueColor={colors.gray[5]}
                        />
                    </Stack>
                </Paper>

                <Paper p="md" radius={5} withBorder>
                    <Stack spacing="sm">
                        <Stack spacing={0}>
                            <Text weight="bold" transform="uppercase">
                                Navigation
                            </Text>
                            <Text fz="xs" c="dimmed">
                                Navigate around the application
                            </Text>
                        </Stack>
                        <FieldValueList
                            fieldValues={{
                                c: "Current Track",
                                p: "Playlist",
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

                <Paper p="md" radius={5} withBorder>
                    <Stack spacing="sm">
                        <Stack spacing={0}>
                            <Text weight="bold" transform="uppercase">
                                Additional
                            </Text>
                            <Text fz="xs" c="dimmed">
                                Additional controls
                            </Text>
                        </Stack>
                        <FieldValueList
                            fieldValues={{
                                "?": "Show this Help screen",
                                L: "Show the current track lyrics",
                                d: "Show the Debug panel",
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
            </Stack>
        </Modal>
    ) : null;
};

export default KeyboardShortcutsManager;

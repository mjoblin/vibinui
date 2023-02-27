import React, { FC } from "react";
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
import { setShowKeyboardShortcuts } from "../../app/store/internalSlice";

const SEEK_OFFSET_SECS = 10;

const KeyboardShortcutsManager: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
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
        ["shift+?", () => dispatch(setShowKeyboardShortcuts(!showKeyboardShortcuts))],
        ["j", () => seek(Math.max(position - SEEK_OFFSET_SECS, 0))],
        ["k", () => (playStatus === "play" ? pausePlayback() : resumePlayback())],
        ["l", () => duration && seek(Math.min(position + SEEK_OFFSET_SECS, duration))],
        [",", () => previousTrack()],
        [".", () => nextTrack()],
    ]);

    return showKeyboardShortcuts ? (
        <Modal
            opened={showKeyboardShortcuts}
            centered
            title="Keyboard Shortcuts"
            overlayBlur={1}
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
                                Application
                            </Text>
                            <Text fz="xs" c="dimmed">
                                Application-wide controls
                            </Text>
                        </Stack>
                        <FieldValueList
                            fieldValues={{
                                "?": `Show this Help screen`,
                                d: `Show the Debug panel`,
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

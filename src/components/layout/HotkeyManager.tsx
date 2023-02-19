import React, { FC } from "react";
import { Modal, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    usePauseMutation,
    usePlayMutation,
    useSeekMutation,
} from "../../app/services/vibinTransport";
import FieldValueList from "../fieldValueList/FieldValueList";
import { setShowHotkeys } from "../../app/store/internalSlice";

const SEEK_OFFSET_SECS = 10;

const HotkeyManager: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { showHotkeys } = useAppSelector((state: RootState) => state.internal.application);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const duration = useAppSelector((state: RootState) => state.playback.current_track?.duration);
    const position = useAppSelector((state: RootState) => state.playback.playhead.position);
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [seek] = useSeekMutation();

    useHotkeys([
        ["h", () => dispatch(setShowHotkeys(!showHotkeys))],
        ["j", () => seek(Math.max(position - SEEK_OFFSET_SECS, 0))],
        ["k", () => (playStatus === "play" ? pausePlayback() : resumePlayback())],
        ["l", () => duration && seek(Math.min(position + SEEK_OFFSET_SECS, duration))],
    ]);

    return showHotkeys ? (
        <Modal
            opened={showHotkeys}
            centered
            title="Hotkeys"
            overlayBlur={1}
            onClose={() => dispatch(setShowHotkeys(false))}
        >
            <Stack spacing="md">
                <Paper p="md" radius={5} withBorder>
                    <Stack spacing="sm">
                        <Stack spacing={0}>
                            <Text weight="bold">Playback</Text>
                            <Text fz="xs" c="dimmed">
                                Control the playhead during playback
                            </Text>
                        </Stack>
                        <FieldValueList
                            fieldValues={{
                                J: `Seek back ${SEEK_OFFSET_SECS} seconds`,
                                K: "Play/Pause",
                                L: `Seek forwards ${SEEK_OFFSET_SECS} seconds`,
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
                            <Text weight="bold">Application</Text>
                            <Text fz="xs" c="dimmed">
                                Application-wide controls
                            </Text>
                        </Stack>
                        <FieldValueList
                            fieldValues={{
                                H: `Show this Help screen`,
                                D: `Show the Debug panel`,
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

export default HotkeyManager;

import React, { FC, useState } from "react";
import { Modal, Stack, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import {
    usePauseMutation,
    usePlayMutation,
    useSeekMutation,
} from "../../app/services/vibinTransport";
import FieldValueList from "../fieldValueList/FieldValueList";

const SEEK_OFFSET_SECS = 10;

const HotkeyManager: FC = () => {
    const { colors } = useMantineTheme();
    const [showHotkeyHelp, setShowHotkeyHelp] = useState<boolean>(false);
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const duration = useAppSelector((state: RootState) => state.playback.current_track?.duration);
    const position = useAppSelector((state: RootState) => state.playback.playhead.position);
    const [pausePlayback] = usePauseMutation();
    const [resumePlayback] = usePlayMutation();
    const [seek] = useSeekMutation();

    useHotkeys([
        ["h", () => setShowHotkeyHelp(!showHotkeyHelp)],
        ["j", () => seek(Math.max(position - SEEK_OFFSET_SECS, 0))],
        ["k", () => (playStatus === "play" ? pausePlayback() : resumePlayback())],
        ["l", () => duration && seek(Math.min(position + SEEK_OFFSET_SECS, duration))],
    ]);

    return showHotkeyHelp ? (
        <Modal
            opened={showHotkeyHelp}
            centered
            title="Hotkeys"
            overlayBlur={1}
            onClose={() => setShowHotkeyHelp(false)}
        >
            <Stack spacing="md">
                <FieldValueList
                    fieldValues={{
                        J: `Seek back ${SEEK_OFFSET_SECS} seconds`,
                        K: "Play/Pause",
                        L: `Seek forwards ${SEEK_OFFSET_SECS} seconds`,
                        H: `Show this Help screen`,
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
        </Modal>
    ) : null;
};

export default HotkeyManager;

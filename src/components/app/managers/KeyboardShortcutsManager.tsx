import React, { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Modal, Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { HotkeyItem, useDebouncedValue, useHotkeys } from "@mantine/hooks";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useAmplifierMuteToggleMutation,
    useAmplifierVolumeSetMutation,
    useSystemPowerSetMutation,
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

// ================================================================================================
// Manage the application-wide keyboard shortcuts. Listen for hotkey triggers, and display the
// information about the shortcuts when requested.
// ================================================================================================

const KeyboardShortcutsManager: FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { colors } = useMantineTheme();
    const { APP_MODAL_BLUR, SEEK_OFFSET_SECS } = useAppGlobals();
    const { showKeyboardShortcuts } = useAppSelector(
        (state: RootState) => state.internal.application
    );
    const maxVolume = useAppSelector(
        (state: RootState) => state.userSettings.application.amplifierMaxVolume
    );
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const activeTransportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );
    const duration = useAppSelector((state: RootState) => state.playback.current_track?.duration);
    const position = useAppSelector((state: RootState) => state.playback.playhead.position);
    const amplifier = useAppSelector((state: RootState) => state.system.amplifier);
    const amplifierVolume = useAppSelector((state: RootState) => state.system.amplifier?.volume);
    const systemPower = useAppSelector((state: RootState) => state.system.power);
    const [debouncedAmplifierVolume] = useDebouncedValue(amplifierVolume, 2000);
    const [systemPowerSet] = useSystemPowerSetMutation();
    const [volumeSet] = useAmplifierVolumeSetMutation();
    const [amplifierMuteToggle] = useAmplifierMuteToggleMutation();
    const [pausePlayback] = usePauseMutation();
    const [playPlayback] = usePlayMutation();
    const [nextTrack] = useNextTrackMutation();
    const [previousTrack] = usePreviousTrackMutation();
    const [seek] = useSeekMutation();
    const [activeHotkeys, setActiveHotkeys] = useState<HotkeyItem[]>([]);
    const [localVolume, setLocalVolume] = useState<{ value: number | undefined; whenSet: number }>({
        value: amplifierVolume,
        whenSet: Date.now(),
    });

    // Volume control is driven by a local volume state. This local state is allowed to be
    // overridden by a volume update from the backend *only* when the given number of milliseconds
    // have passed since the last local update. This is to allow for fast-feeling local updates
    // (e.g. quickly tapping shift+UpArrow 5 times quickly and having the local volume not be
    // stomped on by a laggy backend volume update).
    const backendVolumeOverrideDelay = 1000;

    // We support two levels of volume increment: 1 unit (0.01) and 5 units (0.05). We use 0.01
    // instead of useAmplifierVolumeUpMutation() and useAmplifierVolumeDownMutation() due to the
    // way we're handling local volume changes vs. backend-driven updates.
    const smallVolumeDelta = 0.01;
    const largeVolumeDelta = 0.05;

    /**
     * Whenever the local volume state changes, send a volumeSet request to the amplifier.
     */
    useEffect(() => {
        typeof localVolume?.value === "number" && volumeSet(localVolume.value);
    }, [localVolume, volumeSet]);

    /**
     * Update local amplifier volume state whenever the actual amplifier volume state changes, but
     * only if enough time has passed since the last user-driven local update.
     */
    useEffect(() => {
        // Allow the initial localVolume value to be set by the backend on arrival.
        if (
            typeof localVolume.value === "undefined" &&
            typeof debouncedAmplifierVolume !== "undefined"
        ) {
            setLocalVolume({ value: debouncedAmplifierVolume, whenSet: Date.now() });
            return;
        }

        // Delay other backend volume overrides based on backendVolumeOverrideDelay.
        typeof debouncedAmplifierVolume === "number" &&
            localVolume.whenSet + backendVolumeOverrideDelay < Date.now() &&
            debouncedAmplifierVolume !== localVolume?.value &&
            setLocalVolume({ value: debouncedAmplifierVolume, whenSet: Date.now() });
    }, [debouncedAmplifierVolume, localVolume]);

    // Hotkeys which should always be available.
    const defaultHotkeys: HotkeyItem[] = useMemo(
        () => [
            [
                "J",
                () =>
                    activeTransportActions.includes("seek") &&
                    seek(Math.max(position - SEEK_OFFSET_SECS, 0)),
            ],
            ["K", () => (playStatus === "play" ? pausePlayback() : playPlayback())],
            [
                "L",
                () =>
                    activeTransportActions.includes("seek") &&
                    duration &&
                    seek(Math.min(position + SEEK_OFFSET_SECS, duration)),
            ],
            ["ArrowLeft", () => activeTransportActions.includes("previous") && previousTrack()],
            ["ArrowRight", () => activeTransportActions.includes("next") && nextTrack()],
            ["C", () => navigate("/ui/current")],
            ["P", () => navigate("/ui/playlist")],
            ["R", () => navigate("/ui/artists")],
            ["A", () => navigate("/ui/albums")],
            ["T", () => navigate("/ui/tracks")],
            ["E", () => navigate("/ui/presets")],
            ["F", () => navigate("/ui/favorites")],
            ["ctrl+shift+1", () => systemPowerSet(systemPower === "on" ? "off" : "on")],
            ["shift+?", () => dispatch(setShowKeyboardShortcuts(!showKeyboardShortcuts))],
            ["shift+L", () => dispatch(setShowCurrentTrackLyrics(true))],
        ],
        [
            activeTransportActions,
            dispatch,
            duration,
            navigate,
            nextTrack,
            pausePlayback,
            playPlayback,
            playStatus,
            position,
            previousTrack,
            seek,
            SEEK_OFFSET_SECS,
            systemPower,
            systemPowerSet,
            showKeyboardShortcuts,
        ]
    );

    // Amplifier specific hotkeys. These are ignore when there's no amplifier.
    const amplifierHotkeys: HotkeyItem[] = useMemo(() => {
        return [
            [
                "ArrowUp",
                () =>
                    typeof localVolume.value !== "undefined" &&
                    localVolume.value < maxVolume &&
                    setLocalVolume({
                        value: Math.min(localVolume.value + smallVolumeDelta, maxVolume),
                        whenSet: Date.now(),
                    }),
            ],
            [
                "ArrowDown",
                () =>
                    typeof localVolume.value !== "undefined" &&
                    localVolume.value > 0 &&
                    setLocalVolume({
                        value: Math.max(localVolume.value - smallVolumeDelta, 0.0),
                        whenSet: Date.now(),
                    }),
            ],
            [
                "shift+ArrowUp",
                () =>
                    typeof localVolume.value !== "undefined" &&
                    localVolume.value < maxVolume &&
                    setLocalVolume({
                        value: Math.min(localVolume.value + largeVolumeDelta, maxVolume),
                        whenSet: Date.now(),
                    }),
            ],
            [
                "shift+ArrowDown",
                () =>
                    typeof localVolume.value !== "undefined" &&
                    localVolume.value > 0 &&
                    setLocalVolume({
                        value: Math.max(localVolume.value - largeVolumeDelta, 0.0),
                        whenSet: Date.now(),
                    }),
            ],
            ["ctrl+shift+ArrowDown", () => amplifierMuteToggle()],
        ];
    }, [amplifierMuteToggle, localVolume, maxVolume]);

    /**
     * Set which hotkeys are active whenever the amplifier becomes available or goes away.
     */
    useEffect(() => {
        setActiveHotkeys([...defaultHotkeys, ...(amplifier ? amplifierHotkeys : [])]);
    }, [amplifier, amplifierHotkeys, defaultHotkeys]);

    useHotkeys(activeHotkeys);

    // --------------------------------------------------------------------------------------------

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
                    <Paper p="md" radius={5} withBorder sx={{ flexGrow: 1 }}>
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
                                {!amplifier && (
                                    <Text fz="xs" c="red">
                                        Requires an amplifier to be registered with Vibin
                                    </Text>
                                )}
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

                    {/* System ----------------------------------------------------------------- */}
                    <Stack spacing="md">
                        <Paper p="md" radius={5} withBorder sx={{ flexGrow: 1 }}>
                            <Stack spacing="sm">
                                <Stack spacing={0}>
                                    <Text weight="bold" transform="uppercase">
                                        System
                                    </Text>
                                </Stack>
                                <FieldValueList
                                    fieldValues={{
                                        "^⇧1": "Power system on/off",
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
                    </Stack>
                </Flex>
            </Stack>
        </Modal>
    ) : null;
};

export default KeyboardShortcutsManager;

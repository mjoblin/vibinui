import React, { FC, useEffect, useRef } from "react";
import {
    ActionIcon,
    Box,
    Center,
    Menu,
    SegmentedControl,
    Select,
    Switch,
    useMantineColorScheme,
} from "@mantine/core";
import { IconBug, IconKeyboard, IconMoon, IconSettings, IconSun } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useLazyPowerToggleQuery, useLazySetSourceQuery } from "../../app/services/vibinSystem";
import { setShowDebugPanel, setShowKeyboardShortcuts } from "../../app/store/internalSlice";
import { showSuccessNotification } from "../../app/utils";
import { PowerStatus } from "../../app/store/systemSlice";
import { AudioSource } from "../../app/store/playbackSlice";

const Settings: FC = () => {
    const dispatch = useAppDispatch();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [togglePower] = useLazyPowerToggleQuery();
    const [setSource] = useLazySetSourceQuery();
    const streamer = useAppSelector((state: RootState) => state.system.streamer);
    const audioSources = useAppSelector((state: RootState) => state.playback.audio_sources);
    const currentAudioSource = useAppSelector(
        (state: RootState) => state.playback.current_audio_source
    );
    const previousPowerState = useRef<PowerStatus>(streamer.power);

    useEffect(() => {
        if (previousPowerState.current === undefined) {
            previousPowerState.current = streamer.power;
            return;
        }

        showSuccessNotification({
            title: "Streamer Power",
            color: streamer.power === "on" ? "teal" : "yellow",
            message: streamer.power
                ? `Streamer has been powered ${streamer.power}`
                : "Unknown streamer power state",
        });

        previousPowerState.current = streamer.power;
    }, [streamer.power]);

    return (
        <Menu shadow="md" width={200} position="top-start" withArrow arrowPosition="center">
            <Menu.Target>
                <ActionIcon variant="default" size="lg">
                    <IconSettings size={18} stroke={1.5} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Streamer</Menu.Label>

                {/* Streamer power toggle */}
                <Menu.Item>
                    <Switch
                        label="Power"
                        checked={streamer.power === "on"}
                        onChange={(event) => togglePower()}
                        onLabel="on"
                        offLabel="off"
                    />
                </Menu.Item>

                {/* Source selector */}
                <Menu.Item closeMenuOnClick={false}>
                    <Select
                        value={currentAudioSource?.id}
                        dropdownPosition="top"
                        maxDropdownHeight={500}
                        onChange={(value) => value && setSource(value)}
                        data={Object.values(audioSources).map((source: AudioSource) => ({
                            value: source.id,
                            label: source.name,
                        }))}
                    />
                </Menu.Item>

                <Menu.Divider />
                <Menu.Label>Application</Menu.Label>
                <Menu.Item
                    icon={<IconKeyboard size={14} />}
                    onClick={() => dispatch(setShowKeyboardShortcuts())}
                >
                    Keyboard Shortcuts...
                </Menu.Item>
                <Menu.Item
                    icon={<IconBug size={14} />}
                    onClick={() => dispatch(setShowDebugPanel())}
                >
                    Debug panel...
                </Menu.Item>
                <Menu.Item>
                    <SegmentedControl
                        size="xs"
                        value={colorScheme}
                        onChange={(value: "light" | "dark") => toggleColorScheme(value)}
                        data={[
                            {
                                value: "light",
                                label: (
                                    <Center>
                                        <IconSun size={16} stroke={1.5} />
                                        <Box ml={10}>Light</Box>
                                    </Center>
                                ),
                            },
                            {
                                value: "dark",
                                label: (
                                    <Center>
                                        <IconMoon size={16} stroke={1.5} />
                                        <Box ml={10}>Dark</Box>
                                    </Center>
                                ),
                            },
                        ]}
                    />
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default Settings;

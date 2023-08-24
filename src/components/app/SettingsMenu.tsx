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
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import {
    useAmplifierPowerToggleMutation,
    useAmplifierSourceSetMutation,
    useStreamerPowerToggleMutation,
    useStreamerSourceSetMutation
} from "../../app/services/vibinSystem";
import { setShowDebugPanel, setShowKeyboardShortcuts } from "../../app/store/internalSlice";
import { showSuccessNotification } from "../../app/utils";
import { AudioSource, PowerState } from "../../app/store/systemSlice";

// ================================================================================================
// Application settings.
//
// Contents:
//  - Streamer power switch.
//  - Streamer audio source selector.
//  - Amplifier power switch.
//  - Amplifier audio source selector.
//  - Dark/light mode toggle.
//  - Access application-wide modals (keyboard shortcuts, debug).
// ================================================================================================

const SettingsMenu: FC = () => {
    const dispatch = useAppDispatch();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [amplifierPowerToggle] = useAmplifierPowerToggleMutation();
    const [streamerPowerToggle] = useStreamerPowerToggleMutation();
    const [amplifierSourceSet] = useAmplifierSourceSetMutation();
    const [streamerSourceSet] = useStreamerSourceSetMutation();
    const amplifier = useAppSelector((state: RootState) => state.system.amplifier);
    const streamer = useAppSelector((state: RootState) => state.system.streamer);
    const previousPowerState = useRef<PowerState>(streamer.power);

    /**
     * Notify the user when the power has been turned on/off.
     *
     * TODO: This feels a little hidden here in the SettingsMenu, since it's notifying about a
     *  fairly global app-wide notion. Might be good to extract this out into a device manager.
     */
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
        <Menu shadow="md" width={210} position="top-start" withArrow arrowPosition="center">
            <Menu.Target>
                <ActionIcon variant="default" size="lg">
                    <IconSettings size={18} stroke={1.5} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                {/* Streamer ------------------------------------------------------------------ */}
                <Menu.Label>Streamer</Menu.Label>

                {/* Power */}
                <Menu.Item closeMenuOnClick={false}>
                    <Switch
                        label="Power"
                        checked={streamer.power === "on"}
                        onChange={(event) => streamerPowerToggle()}
                        onLabel="on"
                        offLabel="off"
                    />
                </Menu.Item>

                {/* Source selector */}
                <Menu.Item closeMenuOnClick={false}>
                    <Select
                        disabled={streamer.power !== "on"}
                        value={streamer?.sources?.active?.name}
                        dropdownPosition="top"
                        maxDropdownHeight={500}
                        onChange={(value) => value && streamerSourceSet(value)}
                        data={
                            streamer?.sources?.available?.map((source: AudioSource) => ({
                                value: source.name,
                                label: source.name,
                            })) || []
                        }
                    />
                </Menu.Item>

                {/* Amplifier ----------------------------------------------------------------- */}
                {!!amplifier && (
                    <>
                        <Menu.Label>Amplifier</Menu.Label>

                        {/* Power */}
                        <Menu.Item closeMenuOnClick={false}>
                            <Switch
                                label="Power"
                                checked={amplifier?.power === "on"}
                                onChange={(event) => amplifierPowerToggle()}
                                onLabel="on"
                                offLabel="off"
                            />
                        </Menu.Item>

                        {/* Source selector */}
                        <Menu.Item closeMenuOnClick={false}>
                            <Select
                                disabled={amplifier.power !== "on"}
                                value={amplifier?.sources?.active?.name}
                                dropdownPosition="top"
                                maxDropdownHeight={500}
                                onChange={(value) =>
                                    value && amplifierSourceSet(value)
                                }
                                data={
                                    amplifier?.sources?.available?.map((source: AudioSource) => ({
                                        value: source.name,
                                        label: source.name,
                                    })) || []
                                }
                            />
                        </Menu.Item>

                        <Menu.Divider />
                    </>
                )}

                {/* Application --------------------------------------------------------------- */}
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

export default SettingsMenu;

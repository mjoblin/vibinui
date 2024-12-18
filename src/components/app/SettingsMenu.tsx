import React, { FC, MutableRefObject, useEffect, useRef } from "react";
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
import {
    IconBug,
    IconKeyboard,
    IconMoon,
    IconSearch,
    IconSettings,
    IconSun,
} from "@tabler/icons-react";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import {
    useAmplifierPowerToggleMutation,
    useAmplifierSourceSetMutation,
    useStreamerPowerToggleMutation,
    useStreamerSourceSetMutation,
} from "../../app/services/vibinSystem";
import {
    setShowDebugPanel,
    setShowKeyboardShortcuts,
    setShowMediaSearch,
} from "../../app/store/internalSlice";
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
//  - Access application-wide modals (media search, keyboard shortcuts, debug).
// ================================================================================================

const SettingsMenu: FC = () => {
    const dispatch = useAppDispatch();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [amplifierPowerToggle] = useAmplifierPowerToggleMutation();
    const [streamerPowerToggle] = useStreamerPowerToggleMutation();
    const [amplifierSourceSet] = useAmplifierSourceSetMutation();
    const [streamerSourceSet] = useStreamerSourceSetMutation();
    const system = useAppSelector((state: RootState) => state.system);
    const amplifier = system.amplifier;
    const streamer = system.streamer;
    const previousAmplifierPowerState = useRef<PowerState>(amplifier?.power);
    const previousStreamerPowerState = useRef<PowerState>(streamer.power);

    /**
     * Notify the user when the power has been turned on/off.
     *
     * TODO: This feels a little hidden here in the SettingsMenu, since it's notifying about a
     *  fairly global app-wide notion. Might be good to extract this out into a device manager.
     */
    useEffect(() => {
        const checkIfPowerChanged = (
            device: string,
            thisPowerState: PowerState,
            previousPowerState: MutableRefObject<PowerState>,
        ) => {
            if (thisPowerState === previousPowerState.current) {
                return;
            }

            if (previousPowerState.current !== "on" && previousPowerState.current !== "off") {
                previousPowerState.current = thisPowerState;
                return;
            }

            previousPowerState.current = thisPowerState;

            thisPowerState &&
                showSuccessNotification({
                    title: `${device} Power`,
                    color: thisPowerState === "on" ? "teal" : "yellow",
                    message: `${device} has been powered ${thisPowerState}`,
                });
        };

        checkIfPowerChanged("Amplifier", amplifier?.power, previousAmplifierPowerState);
        checkIfPowerChanged("Streamer", streamer.power, previousStreamerPowerState);
    }, [amplifier?.power, streamer.power]);

    const showAmplifierPower = amplifier?.power != null;
    const showAmplifierSources = amplifier?.sources != null;
    const isAmpAvailable =
        amplifier && (amplifier.power ? amplifier.power === "on" : system.power === "on");

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
                {(showAmplifierPower || showAmplifierSources) && (
                    <>
                        <Menu.Label>Amplifier</Menu.Label>

                        {/* Power */}
                        {showAmplifierPower && (
                            <Menu.Item closeMenuOnClick={false}>
                                <Switch
                                    label="Power"
                                    checked={amplifier?.power === "on"}
                                    disabled={!amplifier?.supported_actions?.includes("power")}
                                    onChange={(event) => amplifierPowerToggle()}
                                    onLabel="on"
                                    offLabel="off"
                                />
                            </Menu.Item>
                        )}

                        {/* Source selector */}
                        {showAmplifierSources && (
                            <Menu.Item closeMenuOnClick={false}>
                                <Select
                                    disabled={
                                        !isAmpAvailable ||
                                        !amplifier?.supported_actions?.includes("audio_source")
                                    }
                                    value={amplifier?.sources?.active?.name}
                                    dropdownPosition="top"
                                    maxDropdownHeight={500}
                                    onChange={(value) => value && amplifierSourceSet(value)}
                                    data={
                                        amplifier?.sources?.available?.map(
                                            (source: AudioSource) => ({
                                                value: source.name,
                                                label: source.name,
                                            }),
                                        ) || []
                                    }
                                />
                            </Menu.Item>
                        )}

                        <Menu.Divider />
                    </>
                )}

                {/* Application --------------------------------------------------------------- */}
                <Menu.Label>Application</Menu.Label>
                <Menu.Item
                    icon={<IconSearch size={14} />}
                    onClick={() => dispatch(setShowMediaSearch())}
                >
                    Media Search...
                </Menu.Item>
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

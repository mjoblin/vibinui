import React, { FC, useEffect, useRef, useState } from "react";
import {
    ActionIcon,
    Box,
    Center,
    Menu,
    SegmentedControl,
    Switch,
    useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconBug, IconKeyboard, IconMoon, IconSettings, IconSun } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";
import { setShowDebugPanel, setShowHotkeys } from "../../app/store/internalSlice";
import { PowerStatus } from "../../app/store/systemSlice";

const Settings: FC = () => {
    const dispatch = useAppDispatch();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [togglePower] = useLazyPowerToggleQuery();
    const streamer = useAppSelector((state: RootState) => state.system.streamer);
    const previousPowerState = useRef<PowerStatus>(streamer.power);

    useEffect(() => {
        if (previousPowerState.current === undefined) {
            previousPowerState.current = streamer.power;
            return;
        }

        showNotification({
            title: `Streamer Power`,
            color: streamer.power === "on" ? "green" : "yellow",
            message: streamer.power
                ? `Streamer has been powered ${streamer.power}`
                : "Unknown streamer power state",
        });

        previousPowerState.current = streamer.power;
    }, [streamer.power]);

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="default" size="lg">
                    <IconSettings size={18} stroke={1.5} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Streamer</Menu.Label>
                <Menu.Item>
                    <Switch
                        label="Power"
                        checked={streamer.power === "on"}
                        onChange={(event) => togglePower()}
                        onLabel="on"
                        offLabel="off"
                    />
                </Menu.Item>

                <Menu.Divider />
                <Menu.Label>Application</Menu.Label>
                <Menu.Item
                    icon={<IconKeyboard size={14} />}
                    onClick={() => dispatch(setShowHotkeys())}
                >
                    Show Hotkeys...
                </Menu.Item>
                <Menu.Item
                    icon={<IconBug size={14} />}
                    onClick={() => dispatch(setShowDebugPanel())}
                >
                    Show Debug panel...
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

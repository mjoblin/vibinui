import React, { FC } from "react";
import {
    Box,
    Button,
    Center,
    Group,
    Menu,
    SegmentedControl,
    Switch,
    Tooltip,
    UnstyledButton,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { IconMoon, IconMoonStars, IconPower, IconSettings, IconSun } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { useLazyPowerToggleQuery } from "../../app/services/vibinSystem";

const Settings: FC = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const [togglePower] = useLazyPowerToggleQuery();
    const streamer = useAppSelector((state: RootState) => state.system.streamer);

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <UnstyledButton>
                    <IconSettings stroke={1.5} />
                </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Streamer</Menu.Label>
                <Menu.Item icon={<IconPower size={18} />}>
                    <Switch
                        label={streamer.name}
                        checked={streamer.power === "on"}
                        onChange={(event) => togglePower()}
                        onLabel="on"
                        offLabel="off"
                    />
                </Menu.Item>

                <Menu.Divider />
                <Menu.Label>Application</Menu.Label>

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

                    {/*<Group position="center" my={30}>*/}
                    {/*    <Switch*/}
                    {/*        checked={colorScheme === "dark"}*/}
                    {/*        onChange={() => toggleColorScheme()}*/}
                    {/*        size="sm"*/}
                    {/*        onLabel={<IconSun color={theme.white} size={20} stroke={1.5} />}*/}
                    {/*        offLabel={*/}
                    {/*            <IconMoonStars*/}
                    {/*                color={theme.colors.gray[6]}*/}
                    {/*                size={20}*/}
                    {/*                stroke={1.5}*/}
                    {/*            />*/}
                    {/*        }*/}
                    {/*    />*/}
                    {/*</Group>*/}
                </Menu.Item>

                {/*<Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>*/}
                {/*<Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>*/}
                {/*<Menu.Item icon={<IconPhoto size={14} />}>Gallery</Menu.Item>*/}
                {/*<Menu.Item*/}
                {/*    icon={<IconSearch size={14} />}*/}
                {/*    rightSection={*/}
                {/*        <Text size="xs" color="dimmed">*/}
                {/*            ⌘K*/}
                {/*        </Text>*/}
                {/*    }*/}
                {/*>*/}
                {/*    Search*/}
                {/*</Menu.Item>*/}

                {/*<Menu.Item icon={<IconArrowsLeftRight size={14} />}>Transfer my data</Menu.Item>*/}
            </Menu.Dropdown>
        </Menu>

        // <Tooltip
        //     label={`Turn ${streamer.name} ${streamer.power === "on" ? "off" : "on"}`}
        //     color="blue"
        //     openDelay={500}
        //     withArrow
        //     arrowSize={8}
        //     styles={{ tooltip: { fontSize: 12 } }}
        // >
        //     <Box>
        //         <Switch
        //             label={streamer.name}
        //             checked={streamer.power === "on"}
        //             onChange={(event) => togglePower()}
        //             onLabel="on"
        //             offLabel="off"
        //         />
        //     </Box>
        // </Tooltip>
    );
};

export default Settings;

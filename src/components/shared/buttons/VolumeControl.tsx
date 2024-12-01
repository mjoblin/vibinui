import React, { FC, useEffect, useState } from "react";
import {
    ActionIcon,
    Box,
    Center,
    Flex,
    Popover,
    RingProgress,
    Slider,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconVolume, IconVolumeOff } from "@tabler/icons-react";

import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useAmplifierMuteToggleMutation,
    useAmplifierVolumeSetMutation,
} from "../../../app/services/vibinSystem";

// ================================================================================================
// Allow for amplifier volume adjustment and mute control.
//
// For volume adjustment, the component only sends a new volume setting to the amplifier once the
// user completes their volume slider changes. This represents a tradeoff between smooth slider
// controls, live-updating (on the amplifier) volume adjustments, and network traffic. An alternate
// approach might be to allow live amplifier updates as the slider is adjusted, but throttle the
// network requests if necessary.
// ================================================================================================

const VolumeControl: FC = () => {
    const { colors } = useMantineTheme();
    const [opened, { close, open }] = useDisclosure(false);
    const { HEADER_HEIGHT } = useAppGlobals();
    const system = useAppSelector((state: RootState) => state.system);
    const [amplifierVolumeSet] = useAmplifierVolumeSetMutation();
    const [amplifierMuteToggle] = useAmplifierMuteToggleMutation();
    const [localVolume, setLocalVolume] = useState<number>(0);
    const applicationVolumeLimit = useAppSelector(
        (state: RootState) => state.userSettings.application.volumeLimit,
    );

    const amplifier = system.amplifier;
    const isAmpOn =
        amplifier && (amplifier.power ? amplifier.power === "on" : system.power === "on");
    const canControlMute = amplifier?.supported_actions?.includes("mute");

    /**
     * Whenever a new volume setting comes in from the amplifier, force our local volume state
     * (which might be different due to the user sliding the volume control) to match.
     */
    useEffect(() => {
        typeof amplifier?.volume === "number" && setLocalVolume(amplifier?.volume);
    }, [amplifier?.volume]);

    // Disable volume/mute controls entirely if their current values are missing
    if (
        !amplifier ||
        amplifier.mute === null ||
        amplifier.max_volume == null ||
        amplifier.volume == null
    ) {
        return <></>;
    }

    const { mute, volume, max_volume } = amplifier;
    const volumeLimit = applicationVolumeLimit ?? max_volume;

    // RingProgress uses values out of 100
    const progressCurrentVolume = (volume * 100) / max_volume;
    const progressVolumeLimit = ((volumeLimit - volume) * 100) / max_volume;
    const progressAboveVolumeLimit = ((max_volume - volumeLimit) * 100) / max_volume;

    return (
        <Popover
            width={200}
            position="left-start"
            withArrow
            arrowOffset={17}
            shadow="md"
            opened={opened}
            trapFocus
        >
            <Popover.Target>
                <RingProgress
                    size={HEADER_HEIGHT * 0.9}
                    thickness={5}
                    sections={[
                        { value: progressCurrentVolume, color: isAmpOn ? "blue" : colors.gray[7] },
                        {
                            value: progressVolumeLimit,
                            color: isAmpOn ? colors.gray[7] : colors.gray[8],
                        },
                        {
                            value: progressAboveVolumeLimit,
                            color: isAmpOn ? colors.gray[8] : colors.gray[9],
                        },
                    ]}
                    onClick={() => isAmpOn && (opened ? close() : open())}
                    label={
                        mute === "on" ? (
                            opened ? (
                                <></>
                            ) : (
                                <Center>
                                    <IconVolumeOff size={14} color={colors.gray[6]} />
                                </Center>
                            )
                        ) : (
                            <Text
                                color={isAmpOn ? "blue" : colors.gray[7]}
                                weight={800}
                                align="center"
                                size={13}
                            >
                                {volume}
                            </Text>
                        )
                    }
                    styles={
                        isAmpOn
                            ? {
                                  root: {
                                      ":hover": {
                                          cursor: "pointer",
                                      },
                                  },
                              }
                            : {}
                    }
                />
            </Popover.Target>
            <Popover.Dropdown mt={5}>
                <Flex w="100%" gap={10} align="center">
                    <Box sx={{ flexGrow: 1 }}>
                        <Slider
                            w="100%"
                            min={0}
                            max={volumeLimit}
                            step={1}
                            precision={0}
                            value={localVolume}
                            label={(value) => (
                                <Center>
                                    <Text size={10}>{value}</Text>
                                </Center>
                            )}
                            styles={(theme) => ({
                                label: {
                                    minWidth: 28,
                                    maxWidth: 28,
                                    marginTop: 27,
                                    marginRight: 40,
                                    backgroundColor: colors.blue,
                                    border: `1px solid ${colors.gray[6]}`,
                                    borderRadius: 15,
                                },
                                track: {
                                    backgroundColor:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[3]
                                            : theme.colors.blue[1],
                                },
                                thumb: {
                                    height: 12,
                                    width: 5,
                                    backgroundColor:
                                        theme.colorScheme === "dark" ? theme.white : theme.black,
                                    borderWidth: 1,
                                    boxShadow: theme.shadows.sm,
                                    ":focus": {
                                        outline: "none",
                                    },
                                },
                            })}
                            onChange={(value) => setLocalVolume(value)}
                            onChangeEnd={(value) => {
                                setLocalVolume(value);
                                amplifierVolumeSet(value || 0);
                            }}
                            size={7}
                        />
                    </Box>

                    <Tooltip
                        disabled={canControlMute}
                        label="Mute controls unavailable"
                        withinPortal
                    >
                        <ActionIcon
                            disabled={!canControlMute}
                            mih={20}
                            miw={20}
                            mah={20}
                            maw={20}
                            onClick={() => amplifierMuteToggle()}
                        >
                            {mute === "on" ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
                        </ActionIcon>
                    </Tooltip>
                </Flex>
            </Popover.Dropdown>
        </Popover>
    );
};

export default VolumeControl;

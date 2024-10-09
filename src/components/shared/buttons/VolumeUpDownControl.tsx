// ================================================================================================
// Allows the user to nudge the amplifier's volume up and down.
// ================================================================================================

import { FC } from "react";
import { ActionIcon, Flex, useMantineTheme } from "@mantine/core";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useAmplifierVolumeDownMutation,
    useAmplifierVolumeUpMutation,
} from "../../../app/services/vibinSystem";
import { IconVolume, IconVolume2 } from "@tabler/icons-react";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";

const VolumeUpDownControl: FC = () => {
    const theme = useMantineTheme();
    const { HEADER_ICON_SIZE, STYLE_DISABLEABLE } = useAppGlobals();
    const amplifier = useAppSelector((state: RootState) => state.system.amplifier);
    const [amplifierVolumeUp] = useAmplifierVolumeUpMutation();
    const [amplifierVolumeDown] = useAmplifierVolumeDownMutation();

    const isAmpOff = amplifier?.power === "off";
    const colorStandard =
        theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.dark[3];

    return (
        <Flex gap={3} align="center">
            <ActionIcon
                disabled={isAmpOff}
                sx={STYLE_DISABLEABLE}
                onClick={() => amplifierVolumeDown()}
            >
                <IconVolume2
                    size={HEADER_ICON_SIZE}
                    stroke={1}
                    color={colorStandard}
                    fill={colorStandard}
                />
            </ActionIcon>
            <ActionIcon
                disabled={isAmpOff}
                sx={STYLE_DISABLEABLE}
                onClick={() => amplifierVolumeUp()}
            >
                <IconVolume
                    size={HEADER_ICON_SIZE}
                    stroke={1}
                    color={colorStandard}
                    fill={colorStandard}
                />
            </ActionIcon>
        </Flex>
    );
};

export default VolumeUpDownControl;

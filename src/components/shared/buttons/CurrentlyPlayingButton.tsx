import React, { FC } from "react";
import { ActionIcon, Box, Tooltip, useMantineTheme } from "@mantine/core";
import { IconCurrentLocation } from "@tabler/icons";

// ================================================================================================
// Button to scroll to the currently-playing media.
//
// This button does not manage the actual scrolling (that's managed by the consuming component).
// ================================================================================================

type CurrentlyPlayingButtonProps = {
    disabled?: boolean;
    tooltipLabel?: string;
    onClick?: () => void;
};

const CurrentlyPlayingButton: FC<CurrentlyPlayingButtonProps> = ({
    disabled = false,
    tooltipLabel = "Show current item",
    onClick,
}) => {
    const theme = useMantineTheme();

    return (
        <Tooltip label={tooltipLabel} position="bottom">
            <Box>
                <ActionIcon
                    variant="light"
                    color={theme.primaryColor}
                    disabled={disabled}
                    onClick={() => onClick && onClick()}
                >
                    <IconCurrentLocation size="1rem" />
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default CurrentlyPlayingButton;

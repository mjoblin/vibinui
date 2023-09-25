import React, { FC } from "react";
import { ActionIcon, Box, Tooltip, useMantineTheme } from "@mantine/core";
import { IconArrowAutofitHeight } from "@tabler/icons-react";

import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";

// ================================================================================================
// Button to toggle whether the consuming component should automatically scroll to show the
// currently-playing media when the media changes.
//
// This button does not manage the actual scrolling (that's managed by the consuming component).
// ================================================================================================

type CurrentlyPlayingToggleProps = {
    isOn: boolean;
    disabled?: boolean;
    tooltipLabel?: string;
    onClick?: () => void;
};

const FollowCurrentlyPlayingToggle: FC<CurrentlyPlayingToggleProps> = ({
    isOn = true,
    disabled = false,
    tooltipLabel = "Follow current item",
    onClick,
}) => {
    const theme = useMantineTheme();
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );

    return (
        <Tooltip label={tooltipLabel} position="bottom">
            <Box>
                <ActionIcon
                    variant="light"
                    color={isOn ? "yellow" : theme.primaryColor}
                    disabled={disabled || !currentTrackMediaId}
                    onClick={() => onClick && onClick()}
                >
                    <IconArrowAutofitHeight size="1rem" />
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default FollowCurrentlyPlayingToggle;

import React, { FC } from "react";
import { ActionIcon, Box, Tooltip, useMantineTheme } from "@mantine/core";
import { IconArrowAutofitHeight } from "@tabler/icons";
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
    const { colors } = useMantineTheme();
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );

    return (
        <Tooltip label={tooltipLabel} position="bottom">
            <Box>
                <ActionIcon
                    variant="subtle"
                    color={isOn ? "yellow" : "gray"}
                    disabled={disabled || !currentTrackMediaId}
                    onClick={() => onClick && onClick()}
                >
                    <IconArrowAutofitHeight
                        size="1.2rem"
                        // Specifying a color here when isOn is false to override the "gray" on
                        // <ActionIcon>, because <ActionIcon> only accepts a theme key and not a
                        // level (0 thru 9) within that key.
                        color={
                            !isOn && !disabled && currentTrackMediaId ? colors.dark[3] : undefined
                        }
                    />
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default FollowCurrentlyPlayingToggle;

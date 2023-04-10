import React, { FC } from "react";
import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconCurrentLocation } from "@tabler/icons";

import { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/useInterval";

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
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );

    return (
        <Tooltip label={tooltipLabel} position="bottom">
            <Box>
                <ActionIcon
                    variant="subtle"
                    color="yellow"
                    disabled={disabled || !currentTrackMediaId}
                    onClick={() => onClick && onClick()}
                >
                    <IconCurrentLocation size="1.2rem" />
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default CurrentlyPlayingButton;

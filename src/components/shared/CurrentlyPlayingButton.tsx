import React, { FC } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCurrentLocation } from "@tabler/icons";

import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";

type CurrentlyPlayingButtonProps = {
    disabled?: boolean;
    onClick?: () => void;
};

const CurrentlyPlayingButton: FC<CurrentlyPlayingButtonProps> = ({ disabled = false, onClick }) => {
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );

    return (
        <Tooltip label="Scroll current Track into view" position="bottom">
            <ActionIcon
                color="yellow"
                disabled={disabled || !currentTrackMediaId}
                onClick={() => onClick && onClick()}
            >
                <IconCurrentLocation size="1.2rem" />
            </ActionIcon>
        </Tooltip>
    );
};

export default CurrentlyPlayingButton;

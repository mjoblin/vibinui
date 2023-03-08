import React, { FC } from "react";
import { Badge } from "@mantine/core";

import { MediaSourceClass } from "../../app/types";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

const sourceClassToColor: Record<MediaSourceClass, string> = {
    "stream.radio": "red",
    "digital.usb": "gray",
    "digital.coax": "teal",
    "digital.toslink": "pink",
    "stream.media": "green",
    "stream.service.airplay": "yellow",
    "stream.service.spotify": "lime",
    "stream.service.cast": "indigo",
    "stream.service.roon": "grape",
    "stream.service.tidal": "violet",
};

type MediaSourceBadgeProps = {
    showSource?: boolean;
}

/**
 *
 */
const MediaSourceBadge: FC<MediaSourceBadgeProps> = ({ showSource = false }) => {
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);
    const display = useAppSelector((state: RootState) => state.playback.device_display);

    if (!currentSource?.name) {
        return (
            <Badge variant="outline" color="gray">
                unknown
            </Badge>
        );
    }
    
    const badgeLabel =
        currentSource.class === "stream.service.airplay" && showSource && display?.playback_source
            ? `${currentSource.name} / ${display.playback_source}`
            : currentSource.name;

    return <Badge color={sourceClassToColor[currentSource.class]}>{badgeLabel}</Badge>;
};

export default MediaSourceBadge;

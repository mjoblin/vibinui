import React, { FC } from "react";
import { Badge } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

const sourceClassToColor: Record<string, string> = {
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

/**
 *
 */
const MediaSourceBadge: FC = () => {
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);

    if (!currentSource?.name) {
        return null;
    }

    return <Badge color={sourceClassToColor[currentSource.class]}>{currentSource.name}</Badge>;
};

export default MediaSourceBadge;

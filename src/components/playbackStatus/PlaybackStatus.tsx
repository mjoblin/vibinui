import React, { FC } from "react";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import FieldValueList from "../fieldValueList/FieldValueList";

const PlaybackStatus: FC = () => {
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const repeat = useAppSelector((state: RootState) => state.playback.repeat);
    const shuffle = useAppSelector((state: RootState) => state.playback.shuffle);
    const playhead = useAppSelector((state: RootState) => state.playback.playhead);

    const data = {
        playStatus: playStatus || "",
        repeat: repeat || "",
        shuffle: shuffle || "",
        playhead: `${playhead.position || "unknown"} / ${
            playhead.position_normalized ? playhead.position_normalized.toFixed(3) : "unknown"
        }`,
    };

    return <div>{<FieldValueList fieldValues={data} />}</div>;
};

export default PlaybackStatus;

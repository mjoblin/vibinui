import React, { FC } from "react";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import FieldValueList from "../fieldValueList/FieldValueList";

const TrackDel: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);

    return (
        <div>
            {currentTrack ? <FieldValueList fieldValues={currentTrack} /> : <></>}
        </div>
    );
};

export default TrackDel;

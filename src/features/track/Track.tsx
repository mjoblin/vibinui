import React, { FC } from "react";

import type { RootState } from "../../app/store";
import { useAppSelector } from "../../app/hooks";
import { FieldValueList } from "../../components/FieldValueList";

export const Track: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);

    return (
        <div>
            {currentTrack ? <FieldValueList fieldValues={currentTrack} /> : <></>}
        </div>
    );
};

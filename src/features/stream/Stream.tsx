import React, { FC } from "react";

import type { RootState } from "../../app/store";
import { useAppSelector } from "../../app/hooks";
import { FieldValueList } from "../../components/FieldValueList";

export const Stream: FC = () => {
    const currentStream = useAppSelector((state: RootState) => state.playback.current_stream);

    return (
        <div>
            {currentStream ? <FieldValueList fieldValues={currentStream} /> : <></>}
        </div>
    );
};

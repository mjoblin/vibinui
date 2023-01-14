import React, { FC } from "react";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import FieldValueList from "../fieldValueList/FieldValueList";

const Format: FC = () => {
    const currentFormat = useAppSelector((state: RootState) => state.playback.current_format);

    return (
        <div>
            {currentFormat ? <FieldValueList fieldValues={currentFormat} /> : <></>}
        </div>
    );
};

export default Format;

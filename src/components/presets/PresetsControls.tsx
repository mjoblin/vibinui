import React, { FC } from "react";
import { Flex } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import {
    resetPresetsToDefaults,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import CardControls from "../shared/CardControls";

const PresetsControls: FC = () => {
    const { cardSize, cardGap, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );

    return (
        <Flex pt={7} gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
            {/* Card display settings */}
            <CardControls
                cardSize={cardSize}
                cardGap={cardGap}
                showDetails={showDetails}
                cardSizeSetter={setPresetsCardSize}
                cardGapSetter={setPresetsCardGap}
                showDetailsSetter={setPresetsShowDetails}
                resetter={resetPresetsToDefaults}
            />
        </Flex>
    );
};

export default PresetsControls;

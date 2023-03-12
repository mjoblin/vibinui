import React, { FC } from "react";
import { ColorSwatch, Tooltip, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const BackgroundComputeIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const { TEMPORARY_ACTIVITY_COLOR } = useAppConstants();
    const { isComputingInBackground } = useAppSelector(
        (state: RootState) => state.internal.application
    );

    return (
        <Tooltip label="Lit when background compute is active" width={140} multiline={true}>
            <ColorSwatch
                size={20}
                color={isComputingInBackground ? TEMPORARY_ACTIVITY_COLOR : colors.dark[6]}
            />
        </Tooltip>
    );
};

export default BackgroundComputeIndicator;

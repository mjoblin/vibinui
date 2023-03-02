import React, { FC } from "react";
import { ColorSwatch, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const BackgroundComputeIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const { SELECTED_COLOR } = useAppConstants();
    const { isComputingInBackground } = useAppSelector(
        (state: RootState) => state.internal.application
    );

    return <ColorSwatch size={15} color={isComputingInBackground ? SELECTED_COLOR : colors.dark[6]} />;
};

export default BackgroundComputeIndicator;

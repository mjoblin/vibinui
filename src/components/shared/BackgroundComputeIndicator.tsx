import React, { FC } from "react";
import { ColorSwatch, Tooltip, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const BackgroundComputeIndicator: FC = () => {
    const theme = useMantineTheme();
    const { TEMPORARY_ACTIVITY_COLOR } = useAppConstants();
    const { isComputingInBackground } = useAppSelector(
        (state: RootState) => state.internal.application
    );

    return (
        <Tooltip label="Lit when background compute is active" width={140} multiline={true}>
            <ColorSwatch
                size={20}
                color={
                    isComputingInBackground
                        ? TEMPORARY_ACTIVITY_COLOR
                        : theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.colors.gray[2]
                }
                sx={{ boxShadow: theme.colorScheme === "dark" ? undefined : "none" }}
            />
        </Tooltip>
    );
};

export default BackgroundComputeIndicator;

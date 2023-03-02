import React, { FC } from "react";
import { ColorSwatch, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const apiRegex = new RegExp("^vibin.*Api$");

const WaitingOnAPIIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const { SELECTED_COLOR } = useAppConstants();
    const isAPICallInProgress = useAppSelector((state: RootState) => {
        // Get all state keys which are associated with a vibin api.
        const apis = Object.keys(state).filter((key) => apiRegex.test(key));

        // Check all the queries in all the api state keys, to see if any of them are "pending".
        return apis.some((api: string) =>
            // @ts-ignore
            Object.values(state[api].queries).some((entry) => entry && entry.status === "pending")
        );
    });

    return <ColorSwatch size={15} color={isAPICallInProgress ? SELECTED_COLOR : colors.dark[6]} />;
};

export default WaitingOnAPIIndicator;

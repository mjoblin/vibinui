import React, { FC } from "react";
import { ColorSwatch, Text, Tooltip, useMantineTheme } from "@mantine/core";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

// All vibin API calls are managed by RTK Query APIs found under app/services/. These APIs are all
// named "vibin<Something>Api".
const apiRegex = new RegExp("^vibin.*Api$");

const WaitingOnAPIIndicator: FC = () => {
    const { colors } = useMantineTheme();
    const { SELECTED_COLOR } = useAppConstants();
    const apiCallsInProgress = useAppSelector((state: RootState) => {
        // Get all state keys which are associated with a vibin api.
        const apis = Object.keys(state).filter((key) => apiRegex.test(key));

        // Check all the queries in all the api state keys, to see if any of them are "pending".
        // Add up the number of queries in the pending state.
        //
        // Status should be one of: uninitialized, pending, fulfilled, rejected.
        // See "QueryStatus" in:
        // https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/query/core/apiState.ts

        const apisInPendingState = apis.reduce((pendingCount: number, apiName: string) => {
            // @ts-ignore
            const thisApiPendingCount = Object.values(state[apiName].queries).filter(
                (query: any) => query && query.status === "pending"
            ).length;

            return pendingCount + thisApiPendingCount;
        }, 0);

        return apisInPendingState;
    });

    return (
        <Tooltip label="Lit when API calls are pending">
            <ColorSwatch size={20} color={apiCallsInProgress ? SELECTED_COLOR : colors.dark[6]}>
                {apiCallsInProgress ? (
                    <Text weight="bold" size={12} color={colors.dark[7]}>
                        {apiCallsInProgress}
                    </Text>
                ) : null}
            </ColorSwatch>
        </Tooltip>
    );
};

export default WaitingOnAPIIndicator;

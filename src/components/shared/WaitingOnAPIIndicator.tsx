import React, { FC } from "react";
import { ColorSwatch, List, Popover, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useAppConstants } from "../../app/hooks/useAppConstants";

// All vibin API calls are managed by RTK Query APIs found under app/services/. These APIs are all
// named "vibin<Something>Api".
const apiRegex = new RegExp("^vibin.*Api$");

type WaitingOnAPIIndicatorProps = {
    stealth?: boolean;
}

const WaitingOnAPIIndicator: FC<WaitingOnAPIIndicatorProps> = ({ stealth = false }) => {
    const theme = useMantineTheme();
    const { TEMPORARY_ACTIVITY_COLOR } = useAppConstants();
    const [queryPopoverOpened, { close: closeQueryPopover, open: openQueryPopover }] =
        useDisclosure(false);
    const pendingQueries = useAppSelector((state: RootState) => {
        // Get all state keys which are associated with a vibin api.
        const apis = Object.keys(state).filter((key) => apiRegex.test(key));

        // Check all the queries in all the api state keys, to see if any of them are "pending".
        // Return an array of pending queries from any api.
        //
        // Status should be one of: uninitialized, pending, fulfilled, rejected.
        // See "QueryStatus" in:
        // https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/query/core/apiState.ts

        return apis.reduce((pendingQueries: any[], apiName: string) => {
            // @ts-ignore
            const thisApiPendingQueries = Object.values(state[apiName].queries).filter(
                (query: any) => query && query.status === "pending"
            );

            return [...pendingQueries, ...thisApiPendingQueries];
        }, []);
    });

    const pendingQueryCount = pendingQueries.length;

    if (stealth && pendingQueryCount <= 0) {
        return null;
    }

    return (
        <Popover
            position="top"
            withArrow
            shadow="md"
            disabled={pendingQueryCount === 0}
            opened={queryPopoverOpened}
        >
            <Popover.Target>
                <Tooltip
                    label="Lit when API calls are pending"
                    disabled={pendingQueryCount > 0}
                >
                    <ColorSwatch
                        size={20}
                        color={
                            pendingQueryCount
                                ? TEMPORARY_ACTIVITY_COLOR
                                : theme.colorScheme === "dark"
                                ? theme.colors.dark[6]
                                : theme.colors.gray[2]
                        }
                        sx={{ boxShadow: theme.colorScheme === "dark" ? undefined : "none" }}
                        onMouseEnter={openQueryPopover}
                        onMouseLeave={closeQueryPopover}
                    >
                        {pendingQueryCount ? (
                            <Text weight="bold" size={12} color={theme.colors.dark[7]}>
                                {pendingQueryCount}
                            </Text>
                        ) : null}
                    </ColorSwatch>
                </Tooltip>
            </Popover.Target>
            <Popover.Dropdown>
                <Text size="xs" weight="bold" transform="uppercase">
                    Active API Calls
                </Text>
                <List pt={5}>
                    {pendingQueries
                        .sort((queryA, queryB) => queryA.startedTimeStamp - queryB.startedTimeStamp)
                        .map((query) => (
                            <List.Item key={query.requestId}>
                                <Text size="sm" sx={{ fontFamily: "monospace" }}>
                                    {query.endpointName}
                                </Text>
                            </List.Item>
                        ))}
                </List>
            </Popover.Dropdown>
        </Popover>
    );
};

export default WaitingOnAPIIndicator;

import React, { FC } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Stack, Text, useMantineTheme } from "@mantine/core";

import VibinLogo from "../shared/VibinLogo";

// ================================================================================================
// Top-level React error boundary. This will be displayed whenever an uncaught exception occurs
// within the React context.
//
// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
// ================================================================================================

const ErrorBoundary: FC = () => {
    const { colors } = useMantineTheme();
    const error = useRouteError();

    console.error("vibin error", error);

    return (
        <Stack w="100%" align="center" pt={50}>
            <VibinLogo />

            {isRouteErrorResponse(error) ? (
                <Stack spacing={15}>
                    <Text
                        transform="uppercase"
                        weight="bold'"
                    >{`[${error.status}] ${error.statusText}`}</Text>
                    {error.data?.message && (
                        <Text color={colors.gray[6]}>{error.data.message}</Text>
                    )}
                </Stack>
            ) : (
                <Text>Apologies, an unexpected error has occurred.</Text>
            )}
        </Stack>
    );
};

export default ErrorBoundary;

import React, { FC } from "react";
import { Flex, Loader, Text } from "@mantine/core";

// ================================================================================================
// A loader intended to be used by Mantine's <LoadingOverlay>, to notify the user that a
// connection is being initiated by the streamer (e.g. to internet radio).
//
// It's up to the caller to determine if/when <BufferingLoader> should be displayed (via
// <LoadingOverlay>. TODO: Could this component control its own (and <LoadingOverlay>'s) display.
// ================================================================================================

const ConnectingLoader: FC = () => {
    return (
        <Flex direction="row" gap={10}>
            <Loader size="sm" />
            <Text weight={400}>connecting...</Text>
        </Flex>
    );
}

export default ConnectingLoader;

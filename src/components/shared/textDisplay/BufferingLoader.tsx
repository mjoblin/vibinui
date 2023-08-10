import React, { FC } from "react";
import { Flex, Loader, Text } from "@mantine/core";

// ================================================================================================
// A loader intended to be used by Mantine's <LoadingOverlay>, to notify the user that audio is
// being buffered by the streamer.
//
// It's up to the caller to determine if/when <BufferingLoader> should be displayed (via
// <LoadingOverlay>. TODO: Could this component control its own (and <LoadingOverlay>'s) display.
// ================================================================================================

const BufferingLoader: FC = () => {
    return (
        <Flex direction="row" gap={10}>
            <Loader size="sm" variant="bars" />
            <Text weight={400}>buffering audio...</Text>
        </Flex>
    );
}

export default BufferingLoader;

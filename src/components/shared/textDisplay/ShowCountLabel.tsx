import React, { FC } from "react";
import { Flex, MediaQuery, Text, useMantineTheme } from "@mantine/core";

// ================================================================================================
// Text label "showing {x} of {y} {type}" e.g. "showing 12 of 197 albums".
// ================================================================================================

type ShowCountLabelProps = {
    showing: number;
    of: number;
    type: string;
}

const ShowCountLabel: FC<ShowCountLabelProps> = ({ showing, of, type }) => {
    const { colors } = useMantineTheme();

    return (
        <>
            <MediaQuery largerThan="xl" styles={{ display: "none" }}>
                <Flex gap={3} align="flex-end">
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {showing.toLocaleString()}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        of
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {of.toLocaleString() || 0}
                    </Text>
                </Flex>
            </MediaQuery>

            <MediaQuery smallerThan="xl" styles={{ display: "none" }}>
                <Flex gap={3} align="flex-end">
                    <Text size="xs" color={colors.gray[6]}>
                        Showing
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {showing.toLocaleString()}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        of
                    </Text>
                    <Text size="xs" color={colors.gray[6]} weight="bold">
                        {of.toLocaleString() || 0}
                    </Text>
                    <Text size="xs" color={colors.gray[6]}>
                        {type}
                    </Text>
                </Flex>
            </MediaQuery>
        </>
    );
};

export default ShowCountLabel;
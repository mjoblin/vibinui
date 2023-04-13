import React, { FC } from "react";
import { Popover, Stack, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconQuestionMark } from "@tabler/icons";

// ================================================================================================
// A popover describing the supported syntax of the screen filter input text.
// ================================================================================================

type FilterInstructionsProps = {
    defaultKey: string;
    supportedKeys?: string[];
    examples?: string[];
    note?: string;
};

const FilterInstructions: FC<FilterInstructionsProps> = ({
    defaultKey,
    supportedKeys = [],
    examples = [],
    note,
}) => {
    const { colors } = useMantineTheme();
    const [opened, { close, open }] = useDisclosure(false);

    return (
        <Popover position="bottom" width={350} withArrow arrowPosition="center" opened={opened}>
            <Popover.Target>
                <ThemeIcon size={20} radius={10} variant="light">
                    <IconQuestionMark
                        size={14}
                        stroke={3}
                        color={colors.gray[6]}
                        onMouseEnter={open}
                        onMouseLeave={close}
                    />
                </ThemeIcon>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack spacing={15}>
                    <Stack spacing={5}>
                        <Text size="xs" weight="bold" transform="uppercase">
                            Advanced Search
                        </Text>
                        <Text size="xs">
                            {`Filter cards to those matching the given text. Cards filtered on
                        '${defaultKey}' by default. Multiple criteria filtered using "AND".`}
                        </Text>
                    </Stack>

                    {(examples.length > 0 || supportedKeys.length > 0) && (
                        <Stack spacing={15}>
                            {examples.length > 0 && (
                                <Stack spacing={5}>
                                    <Text size="xs" weight="bold" transform="uppercase">
                                        Examples
                                    </Text>
                                    <Stack spacing={0}>
                                        {examples.map((example) => (
                                            <Text
                                                key={example}
                                                size={12}
                                                sx={{ fontFamily: "monospace" }}
                                            >{`> ${example}`}</Text>
                                        ))}
                                    </Stack>
                                </Stack>
                            )}

                            {supportedKeys.length > 0 && (
                                <Stack spacing={5}>
                                    <Text size="xs" weight="bold" transform="uppercase">
                                        Supported Keys
                                    </Text>
                                    <Stack spacing={0}>
                                        {supportedKeys.map((keyName) => (
                                            <Text
                                                key={keyName}
                                                size={12}
                                                sx={{ fontFamily: "monospace" }}
                                            >
                                                {keyName}
                                            </Text>
                                        ))}
                                    </Stack>
                                </Stack>
                            )}

                            {note && (
                                <>
                                    <Text size="xs" weight="bold" transform="uppercase">
                                        Note
                                    </Text>
                                    <Text size={12}>{note}</Text>
                                </>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
};

export default FilterInstructions;

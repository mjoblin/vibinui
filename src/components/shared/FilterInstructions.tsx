import React, { FC } from "react";
import { Popover, Stack, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconQuestionMark } from "@tabler/icons";

type FilterInstructionsProps = {
    defaultKey: string;
    supportedKeys?: string[];
    examples?: string[];
};

const FilterInstructions: FC<FilterInstructionsProps> = ({
    defaultKey,
    supportedKeys = [],
    examples = [],
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
                    <Text size="xs">
                        {`Filter cards to those matching the given text. Cards filtered on
                        '${defaultKey}' by default. Multiple criteria filtered using "AND".`}
                    </Text>
                    {(examples.length > 0 || supportedKeys.length > 0) && (
                        <Stack spacing={10}>
                            {examples.length > 0 && (
                                <>
                                    <Text size="xs" weight="bold" transform="uppercase">
                                        Examples
                                    </Text>
                                    <Stack spacing={0}>
                                        {examples.map((example) => (
                                            <Text
                                                size={12}
                                                sx={{ fontFamily: "monospace" }}
                                            >{`> ${example}`}</Text>
                                        ))}
                                    </Stack>
                                </>
                            )}

                            {supportedKeys.length > 0 && (
                                <>
                                    <Text size="xs" weight="bold" transform="uppercase">
                                        Supported Keys
                                    </Text>
                                    <Stack spacing={0}>
                                        {supportedKeys.map((example) => (
                                            <Text size={12} sx={{ fontFamily: "monospace" }}>
                                                {example}
                                            </Text>
                                        ))}
                                    </Stack>
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

import React, { FC } from "react";
import { ActionCreator } from "@reduxjs/toolkit";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Popover,
    Slider,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    maxCardGap,
    maxCardSize,
    minCardGap,
    minCardSize,
} from "../../app/store/userSettingsSlice";

import { useAppDispatch } from "../../app/hooks";
import { IconSettings } from "@tabler/icons";

type CardSettingsProps = {
    cardSize: number;
    cardGap: number;
    showDetails: boolean;
    cardSizeSetter?: ActionCreator<any>;
    cardGapSetter?: ActionCreator<any>;
    showDetailsSetter?: ActionCreator<any>;
    resetter?: ActionCreator<any>;
};

const CardControls: FC<CardSettingsProps> = ({
    cardSize,
    cardGap,
    showDetails,
    cardSizeSetter,
    cardGapSetter,
    showDetailsSetter,
    resetter,
}) => {
    const dispatch = useAppDispatch();

    return (
        <Popover width={200} position="bottom-end" withArrow arrowPosition="center">
            <Popover.Target>
                <Tooltip
                    label="Configure card display"
                    position="bottom-end"
                    arrowPosition="center"
                >
                    <Button
                        size="xs"
                        variant="light"
                        leftIcon={<IconSettings size={18} stroke={1.5} />}
                    >
                        Cards
                    </Button>
                </Tooltip>
            </Popover.Target>

            <Popover.Dropdown pb={15}>
                <Stack spacing={15} align="flex-start">
                    {/* Cover size */}
                    <Stack spacing={5} w="100%">
                        {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                        <Text size="sm" sx={{ fontWeight: 500 }}>
                            Art size
                        </Text>
                        <Slider
                            label={null}
                            min={minCardSize}
                            max={maxCardSize}
                            size={5}
                            value={cardSize}
                            onChange={(value) => cardSizeSetter && dispatch(cardSizeSetter(value))}
                        />
                    </Stack>

                    {/* Cover gap */}
                    <Stack spacing={5} w="100%">
                        <Text size="sm" sx={{ fontWeight: 500 }}>
                            Separation
                        </Text>
                        <Slider
                            label={null}
                            min={minCardGap}
                            max={maxCardGap}
                            size={5}
                            value={cardGap}
                            onChange={(value) => cardGapSetter && dispatch(cardGapSetter(value))}
                        />
                    </Stack>

                    {/* Show details toggle */}
                    <Checkbox
                        label="Show details"
                        checked={showDetails}
                        onChange={(event) =>
                            showDetailsSetter && dispatch(showDetailsSetter(!showDetails))
                        }
                    />

                    <Flex gap={10}>
                        {/* Show a "tiny wall" preset */}
                        <Box sx={{ alignSelf: "center" }}>
                            <Button
                                compact
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                    cardGapSetter && dispatch(cardGapSetter(minCardGap));
                                    cardSizeSetter && dispatch(cardSizeSetter(minCardSize));
                                    showDetailsSetter && dispatch(showDetailsSetter(false));
                                }}
                            >
                                Tiny Wall
                            </Button>
                        </Box>

                        {/* Reset to defaults */}
                        <Box sx={{ alignSelf: "center" }}>
                            <Button
                                compact
                                variant="outline"
                                size="xs"
                                onClick={() => resetter && dispatch(resetter())}
                            >
                                Reset
                            </Button>
                        </Box>
                    </Flex>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
};

export default CardControls;

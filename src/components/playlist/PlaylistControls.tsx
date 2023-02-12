import React, { FC } from "react";
import { Center, Flex, SegmentedControl, Text } from "@mantine/core";
import { IconListDetails, IconMenu2 } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PlaylistViewMode, setPlaylistViewMode } from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";

const PlaylistControls: FC = () => {
    const dispatch = useAppDispatch();
    const { viewMode } = useAppSelector((state: RootState) => state.userSettings.playlist);

    return (
        <Flex gap={25}>
            <SegmentedControl
                value={viewMode}
                onChange={(value) =>
                    value && dispatch(setPlaylistViewMode(value as PlaylistViewMode))
                }
                data={[
                    {
                        value: "simple",
                        label: (
                            <Center>
                                <IconMenu2 size={14} />
                                <Text size={14} ml={10}>
                                    Simple
                                </Text>
                            </Center>
                        ),
                    },
                    {
                        value: "detailed",
                        label: (
                            <Center>
                                <IconListDetails size={14} />
                                <Text size={14} ml={10}>
                                    Detailed
                                </Text>
                            </Center>
                        ),
                    },
                ]}
            />
        </Flex>
    );
};

export default PlaylistControls;

import React, { FC, useState } from "react";
import { ActionIcon, Flex, TextInput, Tooltip, useMantineTheme } from "@mantine/core";
import { IconPencil, IconSquareX } from "@tabler/icons-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { setPresetsFilterText } from "../../../app/store/userSettingsSlice";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaWallDisplayControls from "../../shared/buttons/MediaWallDisplayControls";
import FilterInstructions from "../../shared/textDisplay/FilterInstructions";
import ShowCountLabel from "../../shared/textDisplay/ShowCountLabel";
import PresetEditorModal from "./PresetEditorModal";

// ================================================================================================
// Controls for the <PresetsWall>.
//
// Contains:
//  - Filter input
//  - Card controls
// ================================================================================================

const PresetsControls: FC = () => {
    const theme = useMantineTheme();
    const dispatch = useAppDispatch();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { presets } = useAppSelector((state: RootState) => state.presets);
    const { filterText } = useAppSelector((state: RootState) => state.userSettings.presets);
    const { filteredPresetIds } = useAppSelector((state: RootState) => state.internal.presets);
    const [showEditorModal, setShowEditorModal] = useState(false);

    return (
        <Flex gap={25} align="center">
            {/* Filter text */}
            <Flex gap={10} align="center" sx={{ flexGrow: 1 }}>
                <TextInput
                    placeholder="Name filter, or advanced"
                    label="Filter"
                    value={filterText}
                    rightSection={
                        <ActionIcon
                            disabled={!filterText}
                            onClick={() => dispatch(setPresetsFilterText(""))}
                        >
                            <IconSquareX size="1.3rem" style={{ display: "block", opacity: 0.5 }} />
                        </ActionIcon>
                    }
                    onChange={(event) => dispatch(setPresetsFilterText(event.target.value))}
                    styles={{
                        root: {
                            ...STYLE_LABEL_BESIDE_COMPONENT.root,
                            flexGrow: 1,
                        },
                        wrapper: {
                            flexGrow: 1,
                        },
                    }}
                />

                <FilterInstructions
                    defaultKey="name"
                    supportedKeys={["name", "type"]}
                    examples={["favorite station", "type:radio", "easy type:radio"]}
                />
            </Flex>

            <Flex gap={20} justify="right" align="center">
                {/* "Showing x of y presets" */}
                <ShowCountLabel
                    showing={filteredPresetIds.length}
                    of={presets?.length || 0}
                    type="presets"
                />

                <Flex gap={10}>
                    {/* Edit presets button */}
                    <Tooltip label="Edit Presets">
                        <ActionIcon
                            variant="light"
                            color={theme.primaryColor}
                            onClick={() => setShowEditorModal(true)}
                        >
                            <IconPencil size="1rem" />
                        </ActionIcon>
                    </Tooltip>

                    {/* Card display settings */}
                    <MediaWallDisplayControls applicationFeature="presets" />
                </Flex>
            </Flex>

            {/* Preset editor modal */}
            <PresetEditorModal
                presets={presets}
                opened={showEditorModal}
                onClose={() => setShowEditorModal(false)}
            />
        </Flex>
    );
};

export default PresetsControls;

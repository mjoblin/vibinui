import React, { FC, useEffect, useState } from "react";
import { Button, Flex, Modal, Select, Stack, Text } from "@mantine/core";

import { isAlbum, isTrack, Media, Preset, PresetId } from "../../../app/types";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import MediaSummaryBanner from "../textDisplay/MediaSummaryBanner";

// ================================================================================================
// Modal for selecting a Preset slot when adding media to Presets.
// ================================================================================================

type PresetSlotModalProps = {
    media: Media;
    presets: Preset[];
    opened: boolean;
    onSave: (presetId: PresetId) => Promise<void>;
    onClose?: () => void;
};

const PresetSlotModal: FC<PresetSlotModalProps> = ({
    media,
    presets,
    opened,
    onSave,
    onClose = undefined,
}) => {
    const { APP_MODAL_BLUR } = useAppGlobals();
    const [isSaving, setIsSaving] = useState(false);

    // Build slot options (1-99)
    const occupiedSlots = new Set(presets.map((p) => p.id));

    // Find the first empty slot
    const getFirstEmptySlot = (): string | null => {
        for (let i = 1; i <= 99; i++) {
            if (!occupiedSlots.has(i)) {
                return String(i);
            }
        }
        return null;
    };

    const [selectedSlot, setSelectedSlot] = useState<string | null>(getFirstEmptySlot);

    // Reset to first empty slot when modal opens
    useEffect(() => {
        if (opened) {
            setSelectedSlot(getFirstEmptySlot());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);

    const slotOptions = Array.from({ length: 99 }, (_, i) => {
        const slotNumber = i + 1;
        const isOccupied = occupiedSlots.has(slotNumber);
        const preset = presets.find((p) => p.id === slotNumber);
        const label = isOccupied
            ? `${slotNumber} - ${preset?.name || "Occupied"}`
            : `${slotNumber} - Empty`;

        return {
            value: String(slotNumber),
            label,
            disabled: false,
        };
    });

    const handleSave = async () => {
        if (!selectedSlot) return;

        setIsSaving(true);
        try {
            await onSave(parseInt(selectedSlot, 10));
            const mediaTitle = isAlbum(media) || isTrack(media) ? media.title : "Item";
            showSuccessNotification({
                title: "Added to Presets",
                message: `${mediaTitle} saved to Slot ${selectedSlot}`,
            });
            setSelectedSlot(null);
            onClose && onClose();
        } catch (error) {
            showErrorNotification({
                title: "Error adding to Presets",
                message: String(error),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setSelectedSlot(null);
        onClose && onClose();
    };

    const mediaType = isAlbum(media) ? "Album" : isTrack(media) ? "Track" : "Item";

    return (
        <Modal
            title={`Add ${mediaType} to Presets`}
            centered
            size="lg"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={handleClose}
        >
            <Stack>
                <MediaSummaryBanner media={media} showArt={true} />

                <Text size="sm" c="dimmed">
                    Select a Preset slot. Occupied slots will be overwritten.
                </Text>

                <Select
                    label="Preset Slot"
                    placeholder="Select a slot"
                    data={slotOptions}
                    value={selectedSlot}
                    onChange={setSelectedSlot}
                    searchable
                    maxDropdownHeight={300}
                />

                <Flex justify="flex-end" gap="sm" mt="md">
                    <Button variant="subtle" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!selectedSlot}
                        loading={isSaving}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </Flex>
            </Stack>
        </Modal>
    );
};

export default PresetSlotModal;

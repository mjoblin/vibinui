import React, { FC, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import {
    Box,
    Button,
    createStyles,
    Flex,
    Modal,
    ScrollArea,
    SegmentedControl,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import {
    DragDropContext,
    Draggable,
    DragStart,
    DragUpdate,
    Droppable,
    DropResult,
} from "@hello-pangea/dnd";

import { Preset } from "../../../app/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import { useDeletePresetMutation, useMovePresetMutation } from "../../../app/services/vibinPresets";
import { RootState } from "../../../app/store/store";
import { PresetEditorMoveMode, setPresetsEditorMoveMode } from "../../../app/store/userSettingsSlice";
import MediaArt from "../../shared/mediaDisplay/MediaArt";
import VibinIconButton from "../../shared/buttons/VibinIconButton";

// ================================================================================================
// Modal for editing Presets - delete and reorder with drag-and-drop.
// All changes are batched locally until Save is clicked.
// ================================================================================================

const MAX_SLOTS = 99;

type PendingSlot = {
    slotNumber: number;
    preset: Preset | null;
    isDeleted: boolean;
    originalSlotNumber: number;
};


type PresetEditorModalProps = {
    presets: Preset[];
    opened: boolean;
    onClose: () => void;
};

const useStyles = createStyles((theme) => ({
    modalContent: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
    },
    scrollArea: {
        flex: 1,
        minHeight: 0,
    },
    row: {
        display: "flex",
        alignItems: "center",
        padding: "6px 0",
        minHeight: 47, // Ensure consistent row height (35px art + 6px padding top/bottom)
        borderBottom: `1px solid ${theme.colors.gray[8]}`,
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    },
    emptyRow: {
        "& > *": {
            opacity: 0.4,
        },
    },
    deletedRow: {
        opacity: 0.3,
        textDecoration: "line-through",
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[2],
    },
    draggingRow: {
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
        boxShadow: theme.shadows.lg,
        borderRadius: 4,
    },
    swapTargetRow: {
        backgroundColor: `${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]} !important`,
        borderRadius: 4,
    },
    changedSlot: {
        fontWeight: 700,
        color: theme.colors.yellow[5],
    },
    changedRow: {
        backgroundColor: theme.colorScheme === "dark" ? "rgba(60, 50, 0, 0.8)" : theme.colors.yellow[1],
    },
    colSlot: {
        width: 50,
        textAlign: "right",
        paddingRight: 12,
        flexShrink: 0,
    },
    colArt: {
        width: 45,
        flexShrink: 0,
    },
    colName: {
        flex: 1,
        minWidth: 0,
        paddingLeft: 8,
        paddingRight: 8,
    },
    colType: {
        width: 80,
        flexShrink: 0,
    },
    colDelete: {
        width: 40,
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
    },
    colDrag: {
        width: 40,
        flexShrink: 0,
    },
    dragHandle: {
        ...theme.fn.focusStyles(),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
        cursor: "grab",
    },
    disabledDragHandle: {
        opacity: 0.3,
        cursor: "default",
    },
}));

const PresetEditorModal: FC<PresetEditorModalProps> = ({ presets, opened, onClose }) => {
    const theme = useMantineTheme();
    const dispatch = useAppDispatch();
    const { APP_MODAL_BLUR } = useAppGlobals();
    const { classes } = useStyles();
    const [deletePreset] = useDeletePresetMutation();
    const [movePreset] = useMovePresetMutation();
    const dropMode = useAppSelector(
        (state: RootState) => state.userSettings.presets.editorMoveMode
    );

    const [pendingSlots, setPendingSlots] = useState<PendingSlot[]>([]);
    const [preDragSlots, setPreDragSlots] = useState<PendingSlot[] | null>(null);
    const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
    const [dragDestIndex, setDragDestIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize pending slots when modal opens
    useEffect(() => {
        if (opened) {
            const presetById = new Map(presets.map((p) => [p.id, p]));
            const slots: PendingSlot[] = Array.from({ length: MAX_SLOTS }, (_, i) => {
                const slotNumber = i + 1;
                const preset = presetById.get(slotNumber) || null;
                return {
                    slotNumber,
                    preset,
                    isDeleted: false,
                    originalSlotNumber: slotNumber,
                };
            });
            setPendingSlots(slots);
        }
    }, [opened, presets]);

    // Check if there's at least one empty slot (required for any moves)
    const hasEmptySlot = pendingSlots.some((s) => !s.preset || s.isDeleted);

    // Moves are disabled if there are no empty slots
    const canMove = hasEmptySlot;

    // Check if there are any pending changes
    const hasChanges = pendingSlots.some(
        (slot) =>
            slot.isDeleted ||
            (slot.preset && slot.slotNumber !== slot.originalSlotNumber)
    );

    // Apply a move operation to a slots array (used for both preview and final drop)
    const applyMove = (
        slots: PendingSlot[],
        sourceIndex: number,
        destIndex: number,
        mode: PresetEditorMoveMode
    ): PendingSlot[] | null => {
        const sourceSlot = slots[sourceIndex];

        // Can't drag empty or deleted slots
        if (!sourceSlot.preset || sourceSlot.isDeleted) {
            return null;
        }

        const newSlots = [...slots];
        const destSlot = newSlots[destIndex];

        if (mode === "swap") {
            // Swap mode: swap the presets between source and destination
            newSlots[sourceIndex] = {
                ...sourceSlot,
                preset: destSlot.preset,
                originalSlotNumber: destSlot.preset ? destSlot.originalSlotNumber : sourceIndex + 1,
                isDeleted: destSlot.isDeleted,
            };
            newSlots[destIndex] = {
                ...destSlot,
                preset: sourceSlot.preset,
                originalSlotNumber: sourceSlot.originalSlotNumber,
                isDeleted: false,
            };
        } else {
            // Insert mode: standard list reorder - shift items between source and dest
            const movedPreset = sourceSlot.preset;
            const movedOriginalSlot = sourceSlot.originalSlotNumber;

            if (sourceIndex > destIndex) {
                // Dragging up: shift items at dest..source-1 down by 1
                for (let i = sourceIndex; i > destIndex; i--) {
                    const prevSlot = newSlots[i - 1];
                    newSlots[i] = {
                        ...newSlots[i],
                        preset: prevSlot.preset,
                        originalSlotNumber: prevSlot.originalSlotNumber,
                        isDeleted: prevSlot.isDeleted,
                    };
                }
            } else {
                // Dragging down: shift items at source+1..dest up by 1
                for (let i = sourceIndex; i < destIndex; i++) {
                    const nextSlot = newSlots[i + 1];
                    newSlots[i] = {
                        ...newSlots[i],
                        preset: nextSlot.preset,
                        originalSlotNumber: nextSlot.originalSlotNumber,
                        isDeleted: nextSlot.isDeleted,
                    };
                }
            }

            // Place the moved preset at destination
            newSlots[destIndex] = {
                ...newSlots[destIndex],
                preset: movedPreset,
                originalSlotNumber: movedOriginalSlot,
                isDeleted: false,
            };
        }

        return newSlots;
    };

    // Handle before drag start - fires before library's state changes
    // Use flushSync to ensure state updates before library removes the Draggable
    const handleBeforeDragStart = (start: DragStart) => {
        if (dropMode === "swap") {
            flushSync(() => {
                setPreDragSlots([...pendingSlots]);
                setDragSourceIndex(start.source.index);
                setDragDestIndex(null);
            });
        }
    };

    // Handle drag start - for insert mode or if beforeDragStart didn't set state
    const handleDragStart = (start: DragStart) => {
        if (dragSourceIndex === null) {
            // Only set if not already set by handleBeforeDragStart
            setPreDragSlots([...pendingSlots]);
            setDragSourceIndex(start.source.index);
            setDragDestIndex(null);
        }
    };

    // Handle drag update - track current destination for swap preview
    const handleDragUpdate = (update: DragUpdate) => {
        setDragDestIndex(update.destination?.index ?? null);
    };

    // Handle drag end
    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // Clear drag state
        setPreDragSlots(null);
        setDragSourceIndex(null);
        setDragDestIndex(null);

        if (!destination || source.index === destination.index) {
            return;
        }

        const newSlots = applyMove(pendingSlots, source.index, destination.index, dropMode);

        if (newSlots) {
            setPendingSlots(newSlots);
        }
    };

    // Handle delete toggle
    const handleDelete = (index: number) => {
        const newSlots = [...pendingSlots];
        newSlots[index] = {
            ...newSlots[index],
            isDeleted: !newSlots[index].isDeleted,
        };
        setPendingSlots(newSlots);
    };

    // Handle save
    const handleSave = async () => {
        setIsSaving(true);

        try {
            // 1. Compute deletions (presets marked as deleted)
            const deletions = pendingSlots.filter((s) => s.isDeleted && s.preset);

            // 2. Compute moves (non-deleted presets that changed position)
            const moves = pendingSlots.filter(
                (s) =>
                    !s.isDeleted &&
                    s.preset &&
                    s.slotNumber !== s.originalSlotNumber
            );

            // 3. Execute deletions first
            for (const slot of deletions) {
                const result = await deletePreset({ presetId: slot.originalSlotNumber });
                if ("error" in result) {
                    showErrorNotification({
                        title: "Error deleting preset",
                        message: `Failed to delete preset in slot ${slot.originalSlotNumber}`,
                    });
                    setIsSaving(false);
                    return;
                }
            }

            // 4. Execute moves using a smart algorithm:
            //    - First, process moves where the destination is currently empty
            //    - For cycles (e.g., swaps), use a single temp slot to break the cycle
            if (moves.length > 0) {
                // Track current backend state: slot -> originalSlotNumber of preset there
                // After deletions, deleted slots are empty
                const deletedSlots = new Set(deletions.map((s) => s.originalSlotNumber));
                const backendState = new Map<number, number>(); // slot -> originalSlotNumber

                for (const slot of pendingSlots) {
                    if (slot.preset && !deletedSlots.has(slot.originalSlotNumber)) {
                        backendState.set(slot.originalSlotNumber, slot.originalSlotNumber);
                    }
                }

                // Build pending moves: originalSlotNumber -> desiredSlotNumber
                const pendingMoves = new Map<number, number>();
                for (const slot of moves) {
                    pendingMoves.set(slot.originalSlotNumber, slot.slotNumber);
                }

                // Find a temp slot (any slot not in the final occupied set)
                const finalOccupiedSlots = new Set(
                    pendingSlots
                        .filter((s) => s.preset && !s.isDeleted)
                        .map((s) => s.slotNumber)
                );
                let tempSlot = MAX_SLOTS;
                while (finalOccupiedSlots.has(tempSlot) && tempSlot > 0) {
                    tempSlot--;
                }

                // Process moves
                while (pendingMoves.size > 0) {
                    let madeProgress = false;

                    // Try to find a move where the destination is currently empty
                    for (const [fromOriginal, toSlot] of pendingMoves) {
                        // Find where this preset currently is on the backend
                        let currentSlot = -1;
                        for (const [slot, origSlot] of backendState) {
                            if (origSlot === fromOriginal) {
                                currentSlot = slot;
                                break;
                            }
                        }

                        if (currentSlot === -1) {
                            // Preset not found (shouldn't happen)
                            pendingMoves.delete(fromOriginal);
                            continue;
                        }

                        // Check if destination is empty
                        if (!backendState.has(toSlot)) {
                            // Destination is empty, can move directly
                            const result = await movePreset({
                                fromId: currentSlot,
                                toId: toSlot,
                            });
                            if ("error" in result) {
                                showErrorNotification({
                                    title: "Error moving preset",
                                    message: `Failed to move preset from slot ${currentSlot} to slot ${toSlot}`,
                                });
                                setIsSaving(false);
                                return;
                            }

                            // Update backend state
                            backendState.delete(currentSlot);
                            backendState.set(toSlot, fromOriginal);
                            pendingMoves.delete(fromOriginal);
                            madeProgress = true;
                            break;
                        }
                    }

                    // If no direct move was possible, we have a cycle - use temp slot
                    if (!madeProgress && pendingMoves.size > 0) {
                        // Pick any remaining move and use temp slot to break the cycle
                        const [fromOriginal, toSlot] = pendingMoves.entries().next().value;

                        // Find where this preset currently is
                        let currentSlot = -1;
                        for (const [slot, origSlot] of backendState) {
                            if (origSlot === fromOriginal) {
                                currentSlot = slot;
                                break;
                            }
                        }

                        if (currentSlot === -1) {
                            pendingMoves.delete(fromOriginal);
                            continue;
                        }

                        // Move to temp slot first
                        let result = await movePreset({
                            fromId: currentSlot,
                            toId: tempSlot,
                        });
                        if ("error" in result) {
                            showErrorNotification({
                                title: "Error moving preset",
                                message: `Failed to move preset from slot ${currentSlot} to temp slot ${tempSlot}`,
                            });
                            setIsSaving(false);
                            return;
                        }

                        // Update backend state - current slot is now empty, preset is at temp
                        backendState.delete(currentSlot);
                        backendState.set(tempSlot, fromOriginal);

                        // Now the destination might be empty (if the preset there was moved)
                        // or occupied. Either way, we'll process this move in the next iteration
                        // by moving from temp to final destination.
                        // Update the pending move to reflect new location
                        // Actually, we need to track that this preset is now at tempSlot
                        // The pendingMoves still has fromOriginal -> toSlot, which is correct
                        // because backendState now maps tempSlot -> fromOriginal
                    }
                }
            }

            const changeCount = deletions.length + moves.length;
            showSuccessNotification({
                title: "Presets updated",
                message: `${changeCount} change${changeCount !== 1 ? "s" : ""} saved`,
            });

            setIsSaving(false);
            onClose();
        } catch (error) {
            showErrorNotification({
                title: "Error saving changes",
                message: String(error),
            });
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            onClose();
        }
    };

    return (
        <Modal
            title="Edit Presets"
            centered
            size="xl"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={handleClose}
            closeOnClickOutside={!isSaving}
            closeOnEscape={!isSaving}
            styles={{
                content: {
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                },
                body: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                },
            }}
        >
            <Flex direction="column" gap="md" className={classes.modalContent}>
                {/* Warning when moves are disabled */}
                {!canMove && (
                    <Text size="sm" c="yellow" ta="center">
                        Moving Presets requires at least one empty slot. Delete a Preset to enable moves.
                    </Text>
                )}

                {/* Drop mode selector */}
                <Flex justify="flex-end" align="center" gap="sm">
                    <Text size="sm" c="dimmed">
                        Move mode:
                    </Text>
                    <Tooltip
                        label={
                            !canMove
                                ? "Moving requires an empty slot"
                                : dropMode === "swap"
                                  ? "Swap: exchange positions with target"
                                  : "Insert: push target and below down"
                        }
                        position="left"
                    >
                        <SegmentedControl
                            size="xs"
                            color={theme.primaryColor}
                            value={dropMode}
                            onChange={(value) => dispatch(setPresetsEditorMoveMode(value as PresetEditorMoveMode))}
                            data={[
                                { label: "Swap", value: "swap" },
                                { label: "Insert", value: "insert" },
                            ]}
                        />
                    </Tooltip>
                </Flex>

                {/* Preset list with drag-and-drop */}
                <ScrollArea className={classes.scrollArea} offsetScrollbars>
                    <DragDropContext
                        onBeforeDragStart={handleBeforeDragStart}
                        onDragStart={handleDragStart}
                        onDragUpdate={handleDragUpdate}
                        onDragEnd={handleDragEnd}
                    >
                        <Droppable
                            droppableId="preset-list"
                            direction="vertical"
                            renderClone={(provided, snapshot, rubric) => {
                                // Use preDragSlots to keep dragged item content static
                                const slots = preDragSlots || pendingSlots;
                                const slot = slots[rubric.source.index];
                                return (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`${classes.row} ${classes.draggingRow}`}
                                    >
                                        <div className={classes.colSlot}>
                                            <Text size="sm" c="dimmed">
                                                {slot.slotNumber}
                                            </Text>
                                        </div>
                                        <div className={classes.colArt}>
                                            {slot.preset && (
                                                <MediaArt
                                                    artUri={slot.preset.art_url}
                                                    size={35}
                                                />
                                            )}
                                        </div>
                                        <div className={classes.colName}>
                                            <Text size="sm" truncate>
                                                {slot.preset?.name || "(Empty)"}
                                            </Text>
                                        </div>
                                        <div className={classes.colType}>
                                            <Text size="xs" c="dimmed">
                                                {slot.preset?.type || ""}
                                            </Text>
                                        </div>
                                        <div className={classes.colDelete} />
                                        <div className={classes.colDrag}>
                                            <Box className={classes.dragHandle}>
                                                <IconGripVertical size={18} stroke={1.5} />
                                            </Box>
                                        </div>
                                    </div>
                                );
                            }}
                        >
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {pendingSlots.map((slot, index) => {
                                        const isSwapMode = dropMode === "swap";
                                        // Only use dragSourceIndex (not preparingDragIndex) to decide when to show placeholder
                                        // preparingDragIndex would remove the Draggable before the library can start the drag

                                        // In swap mode, when this is the source position being dragged,
                                        // render a static placeholder instead of the Draggable (which returns null)
                                        if (
                                            isSwapMode &&
                                            dragSourceIndex !== null &&
                                            index === dragSourceIndex
                                        ) {
                                            // Determine what to show at the source position
                                            let previewSlot = slot;
                                            if (
                                                preDragSlots &&
                                                dragDestIndex !== null &&
                                                dragSourceIndex !== dragDestIndex
                                            ) {
                                                // Show what's at destination (will be swapped in)
                                                previewSlot = {
                                                    ...slot,
                                                    preset: preDragSlots[dragDestIndex].preset,
                                                    isDeleted: preDragSlots[dragDestIndex].isDeleted,
                                                };
                                            }

                                            const isEmpty = !previewSlot.preset;
                                            const isDeleted = previewSlot.isDeleted;
                                            // Check if this slot has been modified from original
                                            const isSlotChanged = slot.preset && slot.slotNumber !== slot.originalSlotNumber;
                                            // Highlight source position when hovering over a swap target
                                            const showSwapHighlight = dragDestIndex !== null && dragSourceIndex !== dragDestIndex;
                                            const rowClasses = [
                                                classes.row,
                                                isDeleted ? classes.deletedRow : "",
                                                isEmpty ? classes.emptyRow : "",
                                                isSlotChanged ? classes.changedRow : "",
                                                showSwapHighlight ? classes.swapTargetRow : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" ");

                                            // Render static placeholder row at source position
                                            return (
                                                <div
                                                    key={`slot-${slot.slotNumber}`}
                                                    className={rowClasses}
                                                >
                                                    <div className={classes.colSlot}>
                                                        <Text
                                                            size="sm"
                                                            c={isSlotChanged ? undefined : "dimmed"}
                                                            className={isSlotChanged ? classes.changedSlot : undefined}
                                                        >
                                                            {slot.slotNumber}
                                                        </Text>
                                                    </div>
                                                    <div className={classes.colArt}>
                                                        {previewSlot.preset && (
                                                            <MediaArt
                                                                artUri={previewSlot.preset.art_url}
                                                                size={35}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className={classes.colName}>
                                                        <Text size="sm" truncate>
                                                            {previewSlot.preset?.name || "(Empty)"}
                                                        </Text>
                                                    </div>
                                                    <div className={classes.colType}>
                                                        <Text size="xs" c="dimmed">
                                                            {previewSlot.preset?.type || ""}
                                                        </Text>
                                                    </div>
                                                    <div className={classes.colDelete} />
                                                    <div className={classes.colDrag}>
                                                        <Box className={`${classes.dragHandle} ${classes.disabledDragHandle}`}>
                                                            <IconGripVertical size={18} stroke={1.5} />
                                                        </Box>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // For swap mode preview at destination position
                                        let displaySlot = slot;
                                        if (
                                            isSwapMode &&
                                            preDragSlots &&
                                            dragSourceIndex !== null &&
                                            dragDestIndex !== null &&
                                            dragSourceIndex !== dragDestIndex &&
                                            index === dragDestIndex
                                        ) {
                                            // Destination position: show what's being dragged (will swap in)
                                            displaySlot = {
                                                ...slot,
                                                preset: preDragSlots[dragSourceIndex].preset,
                                                isDeleted: preDragSlots[dragSourceIndex].isDeleted,
                                            };
                                        }

                                        // Use displaySlot for visual styling (preview)
                                        const isEmpty = !displaySlot.preset;
                                        const isDeleted = displaySlot.isDeleted;
                                        // Use actual slot for drag capability
                                        const canDrag = canMove && !!slot.preset && !slot.isDeleted;
                                        // Check if this slot has been modified from original
                                        const isSlotChanged = slot.preset && slot.slotNumber !== slot.originalSlotNumber;

                                        const rowClasses = [
                                            classes.row,
                                            isDeleted ? classes.deletedRow : "",
                                            isEmpty ? classes.emptyRow : "",
                                            isSlotChanged ? classes.changedRow : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ");

                                        return (
                                            <Draggable
                                                key={`slot-${slot.slotNumber}`}
                                                index={index}
                                                draggableId={`slot-${slot.slotNumber}`}
                                                isDragDisabled={!canDrag}
                                            >
                                                {(provided, snapshot) => {
                                                    // For swap mode, extract only the data attributes from draggableProps
                                                    // and ignore style/onTransitionEnd to prevent shifting
                                                    const {
                                                        style: draggableStyle,
                                                        onTransitionEnd,
                                                        ...draggableDataProps
                                                    } = provided.draggableProps;

                                                    return (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...draggableDataProps}
                                                        style={
                                                            isSwapMode
                                                                ? { ...draggableStyle, transform: "none" }
                                                                : draggableStyle
                                                        }
                                                        onTransitionEnd={isSwapMode ? undefined : onTransitionEnd}
                                                        className={`${rowClasses} ${snapshot.isDragging ? classes.draggingRow : ""}`}
                                                    >
                                                        {/* Slot number */}
                                                        <div className={classes.colSlot}>
                                                            <Text
                                                                size="sm"
                                                                c={isSlotChanged ? undefined : "dimmed"}
                                                                className={isSlotChanged ? classes.changedSlot : undefined}
                                                            >
                                                                {slot.slotNumber}
                                                            </Text>
                                                        </div>

                                                        {/* Art */}
                                                        <div className={classes.colArt}>
                                                            {displaySlot.preset && (
                                                                <MediaArt
                                                                    artUri={displaySlot.preset.art_url}
                                                                    size={35}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Name */}
                                                        <div className={classes.colName}>
                                                            <Text size="sm" truncate>
                                                                {displaySlot.preset?.name || "(Empty)"}
                                                            </Text>
                                                        </div>

                                                        {/* Type */}
                                                        <div className={classes.colType}>
                                                            <Text size="xs" c="dimmed">
                                                                {displaySlot.preset?.type || ""}
                                                            </Text>
                                                        </div>

                                                        {/* Delete button */}
                                                        <div className={classes.colDelete}>
                                                            {slot.preset && (
                                                                <VibinIconButton
                                                                    icon={IconTrash}
                                                                    container={false}
                                                                    tooltipLabel={
                                                                        isDeleted
                                                                            ? "Undo delete"
                                                                            : "Mark for deletion"
                                                                    }
                                                                    onClick={() => handleDelete(index)}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Drag handle */}
                                                        <div className={classes.colDrag}>
                                                            <Box
                                                                className={`${classes.dragHandle} ${
                                                                    !canDrag
                                                                        ? classes.disabledDragHandle
                                                                        : ""
                                                                }`}
                                                                {...(canDrag
                                                                    ? provided.dragHandleProps
                                                                    : {})}
                                                            >
                                                                <IconGripVertical
                                                                    size={18}
                                                                    stroke={1.5}
                                                                />
                                                            </Box>
                                                        </div>
                                                    </div>
                                                    );
                                                }}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </ScrollArea>

                {/* Footer buttons */}
                <Flex justify="flex-end" gap="sm" mt="md">
                    <Button variant="subtle" onClick={handleClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!hasChanges}
                        loading={isSaving}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </Flex>
            </Flex>
        </Modal>
    );
};

export default PresetEditorModal;

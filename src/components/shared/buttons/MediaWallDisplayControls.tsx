import React, { FC, useState } from "react";
import { ActionCreator } from "@reduxjs/toolkit";
import {
    ActionIcon,
    Box,
    Button,
    Checkbox,
    Divider,
    Flex,
    Popover,
    Slider,
    Stack,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { ApplicationFeature } from "../../../app/types";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import {
    maxCardGap,
    maxCardSize,
    minCardGap,
    minCardSize,
    resetAlbumsToDefaults,
    resetApplicationMediaSearchToDefaults,
    resetFavoritesToDefaults,
    resetPresetsToDefaults,
    resetTracksToDefaults,
    setAlbumsCardGap,
    setAlbumsCardSize,
    setAlbumsShowDetails,
    setAlbumsWallSortDirection,
    setAlbumsWallSortField,
    setAlbumsWallViewMode,
    setApplicationMediaSearchCardGap,
    setApplicationMediaSearchCardSize,
    setApplicationMediaSearchShowDetails,
    setApplicationMediaSearchWallSortDirection,
    setApplicationMediaSearchWallSortField,
    setApplicationMediaSearchWallViewMode,
    setFavoritesCardGap,
    setFavoritesCardSize,
    setFavoritesShowDetails,
    setFavoritesWallSortDirection,
    setFavoritesWallSortField,
    setFavoritesWallViewMode,
    setPresetsCardGap,
    setPresetsCardSize,
    setPresetsShowDetails,
    setPresetsWallSortDirection,
    setPresetsWallSortField,
    setPresetsWallViewMode,
    setTracksCardGap,
    setTracksCardSize,
    setTracksShowDetails,
    setTracksWallSortDirection,
    setTracksWallSortField,
    setTracksWallViewMode,
} from "../../../app/store/userSettingsSlice";
import MediaSortDirectionSelector from "./MediaSortDirectionSelector";
import MediaSortFieldSelector from "./MediaSortFieldSelector";
import MediaWallViewModeSelector from "./MediaWallViewModeSelector";

// ================================================================================================
// Media display controls.
//
// - Card vs. Table view selector.
// - Sort field.
// - Card display settings (art size, separation size, etc).
// ================================================================================================

// TODO: Passing all the state/setters in as props isn't scalable as more controls get added. Might
//  want to reconsider this approach in the future. This component could accept a single prop for
//  the app feature ("albums", "mediaSearch", etc), and then own the determination of which view
//  state and state setter to use.
type MediaWallDisplayControlsProps = {
    applicationFeature?: ApplicationFeature;
};

const MediaWallDisplayControls: FC<MediaWallDisplayControlsProps> = ({ applicationFeature }) => {
    const theme = useMantineTheme();
    const dispatch = useAppDispatch();
    const {
        SORTABLE_MEDIA_FIELDS_ALBUMS,
        SORTABLE_MEDIA_FIELDS_FAVORITES,
        SORTABLE_MEDIA_FIELDS_MEDIA_SEARCH,
        SORTABLE_MEDIA_FIELDS_PRESETS,
        SORTABLE_MEDIA_FIELDS_TRACKS,
    } = useAppGlobals();
    const stateRoot = useAppSelector((state: RootState) =>
        applicationFeature === "albums"
            ? state.userSettings.albums
            : applicationFeature === "favorites"
            ? state.userSettings.favorites
            : applicationFeature === "mediaSearch"
            ? state.userSettings.application.mediaSearch
            : applicationFeature === "presets"
            ? state.userSettings.presets
            : applicationFeature === "tracks"
            ? state.userSettings.tracks
            : undefined
    );
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    // @ts-ignore
    const { cardGap, cardSize, wallSortDirection, showDetails, wallSortField, wallViewMode } =
        stateRoot;

    let viewModeSetter: ActionCreator<any> | undefined = undefined;
    let sortFieldSetter: ActionCreator<any> | undefined = undefined;
    let sortDirectionSetter: ActionCreator<any> | undefined = undefined;
    let cardSizeSetter: ActionCreator<any> | undefined = undefined;
    let cardGapSetter: ActionCreator<any> | undefined = undefined;
    let cardDetailsSetter: ActionCreator<any> | undefined = undefined;
    let cardDisplayResetter: ActionCreator<any> | undefined = undefined;
    let sortableFields: string[] = [];

    if (applicationFeature === "albums") {
        viewModeSetter = setAlbumsWallViewMode;
        sortFieldSetter = setAlbumsWallSortField;
        sortDirectionSetter = setAlbumsWallSortDirection;
        cardSizeSetter = setAlbumsCardSize;
        cardGapSetter = setAlbumsCardGap;
        cardDetailsSetter = setAlbumsShowDetails;
        cardDisplayResetter = resetAlbumsToDefaults;
        sortableFields = SORTABLE_MEDIA_FIELDS_ALBUMS;
    } else if (applicationFeature === "favorites") {
        viewModeSetter = setFavoritesWallViewMode;
        sortFieldSetter = setFavoritesWallSortField;
        sortDirectionSetter = setFavoritesWallSortDirection;
        cardSizeSetter = setFavoritesCardSize;
        cardGapSetter = setFavoritesCardGap;
        cardDetailsSetter = setFavoritesShowDetails;
        cardDisplayResetter = resetFavoritesToDefaults;
        sortableFields = SORTABLE_MEDIA_FIELDS_FAVORITES;
    } else if (applicationFeature === "presets") {
        viewModeSetter = setPresetsWallViewMode;
        sortFieldSetter = setPresetsWallSortField;
        sortDirectionSetter = setPresetsWallSortDirection;
        cardSizeSetter = setPresetsCardSize;
        cardGapSetter = setPresetsCardGap;
        cardDetailsSetter = setPresetsShowDetails;
        cardDisplayResetter = resetPresetsToDefaults;
        sortableFields = SORTABLE_MEDIA_FIELDS_PRESETS;
    } else if (applicationFeature === "mediaSearch") {
        viewModeSetter = setApplicationMediaSearchWallViewMode;
        sortFieldSetter = setApplicationMediaSearchWallSortField;
        sortDirectionSetter = setApplicationMediaSearchWallSortDirection;
        cardSizeSetter = setApplicationMediaSearchCardSize;
        cardGapSetter = setApplicationMediaSearchCardGap;
        cardDetailsSetter = setApplicationMediaSearchShowDetails;
        cardDisplayResetter = resetApplicationMediaSearchToDefaults;
        sortableFields = SORTABLE_MEDIA_FIELDS_MEDIA_SEARCH;
    } else if (applicationFeature === "tracks") {
        viewModeSetter = setTracksWallViewMode;
        sortFieldSetter = setTracksWallSortField;
        sortDirectionSetter = setTracksWallSortDirection;
        cardSizeSetter = setTracksCardSize;
        cardGapSetter = setTracksCardGap;
        cardDetailsSetter = setTracksShowDetails;
        cardDisplayResetter = resetTracksToDefaults;
        sortableFields = SORTABLE_MEDIA_FIELDS_TRACKS;
    }

    return (
        <Popover
            position="bottom-end"
            withinPortal
            withArrow
            arrowPosition="center"
            onOpen={() => setMenuOpen(true)}
            onClose={() => setMenuOpen(false)}
        >
            <Popover.Target>
                <Tooltip
                    label="Media display settings"
                    position="bottom-end"
                    arrowPosition="center"
                    disabled={menuOpen}
                >
                    <ActionIcon variant="light" color={theme.primaryColor}>
                        <IconSettings size="1rem" />
                    </ActionIcon>
                </Tooltip>
            </Popover.Target>

            <Popover.Dropdown pb={15}>
                <Stack spacing={15} justify="stretch">
                    {/* View mode */}
                    <Stack spacing={5}>
                        <Text size="xs" weight="bold" transform="uppercase">
                            View Mode
                        </Text>
                        <MediaWallViewModeSelector
                            viewMode={wallViewMode}
                            viewModeSetter={viewModeSetter}
                        />
                    </Stack>

                    {/* Sort */}
                    <Stack spacing={5}>
                        <Text size="xs" weight="bold" transform="uppercase">
                            Sort
                        </Text>
                        <Flex gap={10} align="flex-start">
                            <MediaSortFieldSelector
                                fields={sortableFields}
                                activeField={wallSortField}
                                activeFieldSetter={sortFieldSetter}
                            />

                            <MediaSortDirectionSelector
                                activeDirection={wallSortDirection}
                                activeDirectionSetter={sortDirectionSetter}
                            />
                        </Flex>
                    </Stack>

                    <Divider />

                    {/* Cards */}
                    <Stack spacing={5}>
                        <Text size="xs" weight="bold" transform="uppercase">
                            Cards
                        </Text>

                        <Stack>
                            {/* Cover size */}
                            <Stack spacing={5} w="100%">
                                {/* TODO: Figure out how to properly get <Text> to match the <TextInput> label */}
                                <Text size="sm" sx={{ fontWeight: 500 }}>
                                    Size
                                </Text>
                                <Slider
                                    label={null}
                                    min={minCardSize}
                                    max={maxCardSize}
                                    size={5}
                                    value={cardSize}
                                    onChange={(value) =>
                                        cardSizeSetter && dispatch(cardSizeSetter(value))
                                    }
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
                                    onChange={(value) =>
                                        cardGapSetter && dispatch(cardGapSetter(value))
                                    }
                                />
                            </Stack>

                            {/* Show details toggle */}
                            <Checkbox
                                label="Show details"
                                checked={showDetails}
                                onChange={(event) =>
                                    cardDetailsSetter && dispatch(cardDetailsSetter(!showDetails))
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
                                            cardDetailsSetter && dispatch(cardDetailsSetter(false));
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
                                        onClick={() =>
                                            cardDisplayResetter && dispatch(cardDisplayResetter())
                                        }
                                    >
                                        Reset
                                    </Button>
                                </Box>
                            </Flex>
                        </Stack>
                    </Stack>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
};

export default MediaWallDisplayControls;

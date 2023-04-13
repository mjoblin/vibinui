import React, { FC } from "react";
import { ActionIcon, Flex, Select, TextInput } from "@mantine/core";
import { IconSquareX } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { RootState } from "../../../app/store/store";
import {
    FavoriteCollection,
    resetFavoritesToDefaults,
    setFavoritesActiveCollection,
    setFavoritesCardGap,
    setFavoritesCardSize,
    setFavoritesFilterText,
    setFavoritesShowDetails,
} from "../../../app/store/userSettingsSlice";
import FilterInstructions from "../../shared/textDisplay/FilterInstructions";
import CardControls from "../../shared/buttons/CardControls";
import PlayMediaIdsButton from "../../shared/buttons/PlayMediaIdsButton";
import ShowCountLabel from "../../shared/textDisplay/ShowCountLabel";

// ================================================================================================
// Controls for the <FavoritesWall>.
//
// Contains:
//  - Selector for Favorites to show (Album, Track, or Both)
//  - Filter input
//  - Play favorites
//  - Card controls
// ================================================================================================

const FavoritesControls: FC = () => {
    const dispatch = useAppDispatch();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { activeCollection, cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.favorites
    );
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { filteredFavoriteMediaIds } = useAppSelector(
        (state: RootState) => state.internal.favorites
    );

    return (
        <Flex gap={25} align="flex-end">
            {/* Active collection */}
            <Select
                label="Show"
                value={activeCollection}
                data={[
                    { value: "all", label: "All Favorites" },
                    { value: "albums", label: "Favorite Albums" },
                    { value: "tracks", label: "Favorite Tracks" },
                ]}
                onChange={(value) =>
                    value && dispatch(setFavoritesActiveCollection(value as FavoriteCollection))
                }
                styles={{
                    ...STYLE_LABEL_BESIDE_COMPONENT,
                    input: {
                        width: 160,
                    },
                }}
            />

            {/* Filter text */}
            <Flex gap={10} align="center" sx={{ flexGrow: 1 }}>
                <TextInput
                    placeholder="Title filter, or advanced"
                    label="Filter"
                    value={filterText}
                    rightSection={
                        <ActionIcon
                            disabled={!filterText}
                            onClick={() => dispatch(setFavoritesFilterText(""))}
                        >
                            <IconSquareX size="1.3rem" style={{ display: "block", opacity: 0.5 }} />
                        </ActionIcon>
                    }
                    onChange={(event) => dispatch(setFavoritesFilterText(event.target.value))}
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
                    defaultKey="title"
                    supportedKeys={["title", "artist", "creator", "genre", "date"]}
                    examples={["asparagus", "artist:(the rods) date:2004"]}
                />
            </Flex>

            {/* Replace playlist with favorites */}
            <PlayMediaIdsButton
                mediaIds={[
                    ...filteredFavoriteMediaIds.albums.slice(0, 10),
                    ...filteredFavoriteMediaIds.tracks.slice(0, 100),
                ]}
                tooltipLabel="Replace Playlist with filtered Favorites"
                menuItemLabel="Replace Playlist with filtered Favorites"
                notificationLabel={`Playlist replaced with filtered Favorites`}
                maxToPlay={100}
            />

            <Flex gap={20} justify="right" sx={{ alignSelf: "flex-end" }}>
                {/* "Showing x of y favorites" */}
                <ShowCountLabel
                    showing={
                        filteredFavoriteMediaIds.albums.length +
                        filteredFavoriteMediaIds.tracks.length
                    }
                    of={favorites.length}
                    type="favorites"
                />

                {/* Card display settings */}
                <CardControls
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    cardSizeSetter={setFavoritesCardSize}
                    cardGapSetter={setFavoritesCardGap}
                    showDetailsSetter={setFavoritesShowDetails}
                    resetter={resetFavoritesToDefaults}
                />
            </Flex>
        </Flex>
    );
};

export default FavoritesControls;

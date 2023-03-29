import React, { FC } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Flex,
    Menu,
    Select,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { IconDisc, IconMicrophone2, IconPlayerPlay, IconSquareX } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { RootState } from "../../app/store/store";
import {
    FavoriteCollection,
    resetFavoritesToDefaults,
    setFavoritesActiveCollection,
    setFavoritesCardGap,
    setFavoritesCardSize,
    setFavoritesFilterText,
    setFavoritesShowDetails,
} from "../../app/store/userSettingsSlice";
import {
    usePlayFavoriteAlbumsMutation,
    usePlayFavoriteTracksMutation,
} from "../../app/services/vibinPlaylist";
import { showSuccessNotification } from "../../app/utils";
import FilterInstructions from "../shared/FilterInstructions";
import CardControls from "../shared/CardControls";
import ShowCountLabel from "../shared/ShowCountLabel";

const FavoritesControls: FC = () => {
    const dispatch = useAppDispatch();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { activeCollection, cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.favorites
    );
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { filteredFavoriteMediaIds } = useAppSelector(
        (state: RootState) => state.internal.favorites
    );
    const [playFavoriteAlbums] = usePlayFavoriteAlbumsMutation();
    const [playFavoriteTracks] = usePlayFavoriteTracksMutation();

    const haveFavoriteAlbums = favorites.some((favorite) => favorite.type === "album");
    const haveFavoriteTracks = favorites.some((favorite) => favorite.type === "track");
    const isStreamerOff = streamerPower === "off";
    
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
            <Flex gap={10} align="center">
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
                        ...STYLE_LABEL_BESIDE_COMPONENT,
                        wrapper: {
                            width: CARD_FILTER_WIDTH,
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
            <Tooltip label="Play favorite Albums or Tracks" position="bottom">
                <Box sx={{ alignSelf: "center" }}>
                    <Menu withArrow arrowPosition="center" position="top-start" withinPortal={true}>
                        <Menu.Target>
                            <Button
                                size="xs"
                                variant="light"
                                leftIcon={<IconPlayerPlay size={18} />}
                            >
                                Play
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                disabled={isStreamerOff || !haveFavoriteAlbums}
                                icon={<IconDisc size={14} />}
                                onClick={() => {
                                    playFavoriteAlbums({});

                                    showSuccessNotification({
                                        message: "Playlist replaced with favorite Albums",
                                    });
                                }}
                            >
                                Play Favorite Albums (max 10)
                            </Menu.Item>
                            <Menu.Item
                                disabled={isStreamerOff || !haveFavoriteTracks}
                                icon={<IconMicrophone2 size={14} />}
                                onClick={() => {
                                    playFavoriteTracks({});

                                    showSuccessNotification({
                                        message: "Playlist replaced with favorite Tracks",
                                    });
                                }}
                            >
                                Play Favorite Tracks (max 100)
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Box>
            </Tooltip>

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y favorites" */}
                <ShowCountLabel
                    showing={filteredFavoriteMediaIds.length}
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

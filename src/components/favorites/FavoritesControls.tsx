import React, { FC } from "react";
import {
    ActionIcon,
    Box,
    Flex,
    Menu,
    Select,
    Text,
    TextInput,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconDisc, IconMicrophone2, IconPlayerPlay } from "@tabler/icons";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAppConstants } from "../../app/hooks/useAppConstants";
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

const FavoritesControls: FC = () => {
    const dispatch = useAppDispatch();
    const theme = useMantineTheme();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppConstants();
    const { activeCollection, cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.favorites
    );
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const { favorites } = useAppSelector((state: RootState) => state.favorites);
    const { filteredFavoriteCount } = useAppSelector(
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
                        width: 150,
                    },
                }}
            />

            {/* Filter text */}
            <Flex gap={10} align="center">
                <TextInput
                    placeholder="Filter by Favorite title"
                    label="Filter"
                    value={filterText}
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
                            <ActionIcon variant="filled" color={theme.primaryColor}>
                                <IconPlayerPlay
                                    size="1rem"
                                    color={theme.white}
                                    fill={theme.white}
                                />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                disabled={isStreamerOff || !haveFavoriteAlbums}
                                icon={<IconDisc size={14} />}
                                onClick={() => {
                                    playFavoriteAlbums();

                                    showSuccessNotification({
                                        message: "Playlist replaced with all favorite Albums",
                                    });
                                }}
                            >
                                Play all Favorite Albums
                            </Menu.Item>
                            <Menu.Item
                                disabled={isStreamerOff || !haveFavoriteTracks}
                                icon={<IconMicrophone2 size={14} />}
                                onClick={() => {
                                    playFavoriteTracks();

                                    showSuccessNotification({
                                        message: "Playlist replaced with all favorite Tracks",
                                    });
                                }}
                            >
                                Play all Favorite Tracks
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Box>
            </Tooltip>

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y albums" */}
                <Flex gap={3} align="flex-end">
                    <Text size="xs" color={theme.colors.gray[6]}>
                        Showing
                    </Text>
                    <Text size="xs" color={theme.colors.gray[6]} weight="bold">
                        {filteredFavoriteCount.toLocaleString()}
                    </Text>
                    <Text size="xs" color={theme.colors.gray[6]}>
                        of
                    </Text>
                    <Text size="xs" color={theme.colors.gray[6]} weight="bold">
                        {favorites.length.toLocaleString() || 0}
                    </Text>
                    <Text size="xs" color={theme.colors.gray[6]}>
                        favorites
                    </Text>
                </Flex>

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

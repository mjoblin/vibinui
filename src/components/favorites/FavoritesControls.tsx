import React, { FC, useState } from "react";
import {
    ActionIcon,
    Box,
    createStyles,
    Flex,
    Menu,
    Select,
    TextInput,
    Tooltip,
    useMantineTheme,
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
    useSetPlaylistMediaIdsMutation,
} from "../../app/services/vibinPlaylist";
import { showSuccessNotification } from "../../app/utils";
import FilterInstructions from "../shared/FilterInstructions";
import CardControls from "../shared/CardControls";
import PlayMediaIdsButton from "../shared/PlayMediaIdsButton";
import ShowCountLabel from "../shared/ShowCountLabel";

const darkEnabled = "#C1C2C5";
const lightEnabled = "#000";

const useMenuStyles = createStyles((theme) => ({
    item: {
        fontSize: 12,
        padding: "7px 12px",
        "&[data-hovered]": {
            backgroundColor: theme.colors[theme.primaryColor][theme.fn.primaryShade()],
            color: theme.white,
        },
    },
}));

const FavoritesControls: FC = () => {
    const theme = useMantineTheme();
    const menuStyles = useMenuStyles();
    const dispatch = useAppDispatch();
    const [playMenuOpen, setPlayMenuOpen] = useState<boolean>(false);
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const [setPlaylistIds, setPlaylistIdsStatus] = useSetPlaylistMediaIdsMutation();
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

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
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

import React, { FC, useState } from "react";
import {
    ActionIcon,
    Chip,
    Flex,
    Group,
    Modal,
    Stack,
    Text,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import { IconSquareX } from "@tabler/icons";

import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    resetApplicationMediaSearchToDefaults,
    setApplicationMediaSearchCardGap,
    setApplicationMediaSearchCardSize,
    setApplicationMediaSearchDisplayCategories,
    setApplicationMediaSearchFilterText,
    setApplicationMediaSearchShowDetails,
} from "../../../app/store/userSettingsSlice";
import FilterInstructions from "../textDisplay/FilterInstructions";
import AlbumsWall from "../../features/albums/AlbumsWall";
import TracksWall from "../../features/tracks/TracksWall";
import PresetsWall from "../../features/presets/PresetsWall";
import FavoritesWall from "../../features/favorites/FavoritesWall";
import CardControls from "../buttons/CardControls";
import StylizedLabel from "../textDisplay/StylizedLabel";

// ================================================================================================
// Allow for all media to be searched within one interface.
// ================================================================================================

type MediaSearchModalProps = {
    opened: boolean;
    onClose?: () => void;
};

const MediaSearchModal: FC<MediaSearchModalProps> = ({ opened, onClose = undefined }) => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { cardGap, cardSize, displayCategories, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.application.mediaSearch
    );
    const [albumsDisplayCount, setAlbumsDisplayCount] = useState<number>(0);
    const [tracksDisplayCount, setTracksDisplayCount] = useState<number>(0);
    const [presetsDisplayCount, setPresetsDisplayCount] = useState<number>(0);
    const [favoritesDisplayCount, setFavoritesDisplayCount] = useState<number>(0);

    return (
        <Modal
            title="Media Search"
            size="90%"
            radius={7}
            overlayProps={{ blur: 5.0 }}
            opened={opened}
            onClose={() => onClose && onClose()}
            styles={(theme) => ({
                content: {
                    border: `2px solid ${theme.colors.gray[7]}`,
                },
            })}
        >
            <Stack>
                <Flex gap={10} align="center" sx={{ flexGrow: 1 }}>
                    <TextInput
                        placeholder="Search for media"
                        label="Filter"
                        value={filterText}
                        rightSection={
                            <ActionIcon
                                disabled={!filterText}
                                onClick={() => dispatch(setApplicationMediaSearchFilterText(""))}
                            >
                                <IconSquareX
                                    size="1.3rem"
                                    style={{ display: "block", opacity: 0.5 }}
                                />
                            </ActionIcon>
                        }
                        onChange={(event) =>
                            dispatch(setApplicationMediaSearchFilterText(event.target.value))
                        }
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
                        examples={["favorite album", "squirrels artist:(the rods) date:2004"]}
                    />

                    {/* @ts-ignore */}
                    <Chip.Group
                        multiple
                        value={displayCategories}
                        onChange={(value) =>
                            // @ts-ignore
                            dispatch(setApplicationMediaSearchDisplayCategories(value))
                        }
                    >
                        <Group position="center" spacing="xs">
                            <Chip size="xs" value="albums">
                                Albums
                            </Chip>
                            <Chip size="xs" value="tracks">
                                Tracks
                            </Chip>
                            <Chip size="xs" value="presets">
                                Presets
                            </Chip>
                            <Chip size="xs" value="favorites">
                                Favorites
                            </Chip>
                        </Group>
                    </Chip.Group>

                    {/* Card display settings */}
                    <CardControls
                        cardSize={cardSize}
                        cardGap={cardGap}
                        showDetails={showDetails}
                        cardSizeSetter={setApplicationMediaSearchCardSize}
                        cardGapSetter={setApplicationMediaSearchCardGap}
                        showDetailsSetter={setApplicationMediaSearchShowDetails}
                        resetter={resetApplicationMediaSearchToDefaults}
                    />
                </Flex>

                {typeof filterText === "undefined" || filterText.length < 2 ? (
                    <Text color={colors.gray[6]}>No media search specified</Text>
                ) : (
                    <Stack spacing={0}>
                        {displayCategories.includes("albums") && (
                            <>
                                <StylizedLabel color={colors.gray[7]}>Albums</StylizedLabel>
                                <AlbumsWall
                                    filterText={filterText}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    quietUnlessShowingAlbums={true}
                                    cacheCardRenderSize={false}
                                    onUpdatedDisplayCount={setAlbumsDisplayCount}
                                />

                                {albumsDisplayCount === 0 && (
                                    <Text>No matching albums</Text>
                                )}
                            </>
                        )}

                        {displayCategories.includes("tracks") && (
                            <>
                                <StylizedLabel color={colors.gray[7]}>Tracks</StylizedLabel>
                                <TracksWall
                                    filterText={filterText}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    quietUnlessShowingTracks={true}
                                    cacheCardRenderSize={false}
                                    onUpdatedDisplayCount={setTracksDisplayCount}
                                />

                                {tracksDisplayCount === 0 && (
                                    <Text>No matching tracks</Text>
                                )}
                            </>
                        )}

                        {displayCategories.includes("presets") && (
                            <>
                                <StylizedLabel color={colors.gray[7]}>Presets</StylizedLabel>
                                <PresetsWall
                                    filterText={filterText}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    quietUnlessShowingPresets={true}
                                    onUpdatedDisplayCount={setPresetsDisplayCount}
                                />

                                {presetsDisplayCount === 0 && (
                                    <Text>No matching presets</Text>
                                )}
                            </>
                        )}

                        {displayCategories.includes("favorites") && (
                            <>
                                <StylizedLabel color={colors.gray[7]}>Favorites</StylizedLabel>
                                <FavoritesWall
                                    filterText={filterText}
                                    activeCollection="all"
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    quietUnlessShowingFavorites={true}
                                    cacheCardRenderSize={false}
                                    onUpdatedDisplayCount={setFavoritesDisplayCount}
                                />

                                {favoritesDisplayCount === 0 && (
                                    <Text>No matching favorites</Text>
                                )}
                            </>
                        )}
                    </Stack>
                )}
            </Stack>
        </Modal>
    );
};

export default MediaSearchModal;

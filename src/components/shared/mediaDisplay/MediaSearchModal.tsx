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
    MediaSearchDisplayCategory,
    resetApplicationMediaSearchToDefaults,
    setApplicationMediaSearchCardGap,
    setApplicationMediaSearchCardSize,
    setApplicationMediaSearchDisplayCategories,
    setApplicationMediaSearchFilterText,
    setApplicationMediaSearchShowDetails,
    setApplicationMediaSearchWallViewMode
} from "../../../app/store/userSettingsSlice";
import FilterInstructions from "../textDisplay/FilterInstructions";
import AlbumsWall from "../../features/albums/AlbumsWall";
import TracksWall from "../../features/tracks/TracksWall";
import PresetsWall from "../../features/presets/PresetsWall";
import FavoritesWall from "../../features/favorites/FavoritesWall";
import MediaWallDisplayControls from "../buttons/MediaWallDisplayControls";
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
    const theme = useMantineTheme();
    const { STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { cardGap, cardSize, displayCategories, filterText, showDetails, wallViewMode } =
        useAppSelector((state: RootState) => state.userSettings.application.mediaSearch);
    const [albumsDisplayCount, setAlbumsDisplayCount] = useState<number>(0);
    const [tracksDisplayCount, setTracksDisplayCount] = useState<number>(0);
    const [presetsDisplayCount, setPresetsDisplayCount] = useState<number>(0);
    const [favoritesDisplayCount, setFavoritesDisplayCount] = useState<number>(0);
    const [isAlbumsFilterExecuting, setIsAlbumsFilterExecuting] = useState<boolean>(false);
    const [isTracksFilterExecuting, setIsTracksFilterExecuting] = useState<boolean>(false);
    const [isPresetsFilterExecuting, setIsPresetsFilterExecuting] = useState<boolean>(false);
    const [isFavoritesFilterExecuting, setIsFavoritesFilterExecuting] = useState<boolean>(false);

    const headerColor = theme.colors.gray[5];
    const headerSize = 25;
    const tableStripeColor =
        theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[2];

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
                        data-autofocus
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
                        withinPortal={true}
                    />

                    <Chip.Group
                        multiple
                        value={displayCategories}
                        onChange={(value: MediaSearchDisplayCategory[]) =>
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
                    {/*<MediaWallDisplayControls*/}
                    {/*    viewMode={wallViewMode}*/}
                    {/*    viewModeSetter={setApplicationMediaSearchWallViewMode}*/}
                    {/*    cardSize={cardSize}*/}
                    {/*    cardGap={cardGap}*/}
                    {/*    cardDetails={showDetails}*/}
                    {/*    cardSizeSetter={setApplicationMediaSearchCardSize}*/}
                    {/*    cardGapSetter={setApplicationMediaSearchCardGap}*/}
                    {/*    cardDetailsSetter={setApplicationMediaSearchShowDetails}*/}
                    {/*    cardDisplayResetter={resetApplicationMediaSearchToDefaults}*/}
                    {/*/>*/}
                </Flex>

                {typeof filterText === "undefined" || filterText.length < 2 ? (
                    <Text color={theme.colors.gray[6]}>No media search specified</Text>
                ) : (
                    <Stack spacing={0}>
                        {displayCategories.includes("albums") && (
                            <>
                                <StylizedLabel color={headerColor} size={headerSize}>
                                    Albums
                                </StylizedLabel>
                                <AlbumsWall
                                    filterText={filterText}
                                    viewMode={wallViewMode}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    tableStripeColor={tableStripeColor}
                                    quietUnlessShowingAlbums={true}
                                    cacheCardRenderSize={false}
                                    onIsFilteringUpdate={setIsAlbumsFilterExecuting}
                                    onDisplayCountUpdate={setAlbumsDisplayCount}
                                />

                                {albumsDisplayCount === 0 && !isAlbumsFilterExecuting && (
                                    <Text color={theme.colors.gray[6]} pb={5}>
                                        No matching albums
                                    </Text>
                                )}
                            </>
                        )}

                        {displayCategories.includes("tracks") && (
                            <>
                                <StylizedLabel color={headerColor} size={headerSize}>
                                    Tracks
                                </StylizedLabel>
                                <TracksWall
                                    filterText={filterText}
                                    viewMode={wallViewMode}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    tableStripeColor={tableStripeColor}
                                    quietUnlessShowingTracks={true}
                                    cacheCardRenderSize={false}
                                    onIsFilteringUpdate={setIsTracksFilterExecuting}
                                    onDisplayCountUpdate={setTracksDisplayCount}
                                />

                                {tracksDisplayCount === 0 && !isTracksFilterExecuting && (
                                    <Text color={theme.colors.gray[6]} pb={5}>
                                        No matching tracks
                                    </Text>
                                )}
                            </>
                        )}

                        {displayCategories.includes("presets") && (
                            <>
                                <StylizedLabel color={headerColor} size={headerSize}>
                                    Presets
                                </StylizedLabel>
                                <PresetsWall
                                    filterText={filterText}
                                    viewMode={wallViewMode}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    tableStripeColor={tableStripeColor}
                                    quietUnlessShowingPresets={true}
                                    onIsFilteringUpdate={setIsPresetsFilterExecuting}
                                    onDisplayCountUpdate={setPresetsDisplayCount}
                                />

                                {presetsDisplayCount === 0 && !isPresetsFilterExecuting && (
                                    <Text color={theme.colors.gray[6]} pb={5}>
                                        No matching presets
                                    </Text>
                                )}
                            </>
                        )}

                        {displayCategories.includes("favorites") && (
                            <>
                                <StylizedLabel color={headerColor} size={headerSize}>
                                    Favorites
                                </StylizedLabel>
                                <FavoritesWall
                                    filterText={filterText}
                                    activeCollection="all"
                                    viewMode={wallViewMode}
                                    cardSize={cardSize}
                                    cardGap={cardGap}
                                    showDetails={showDetails}
                                    tableStripeColor={tableStripeColor}
                                    quietUnlessShowingFavorites={true}
                                    cacheCardRenderSize={false}
                                    onIsFilteringUpdate={setIsFavoritesFilterExecuting}
                                    onDisplayCountUpdate={setFavoritesDisplayCount}
                                />

                                {favoritesDisplayCount === 0 && !isFavoritesFilterExecuting && (
                                    <Text color={theme.colors.gray[6]} pb={5}>
                                        No matching favorites
                                    </Text>
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

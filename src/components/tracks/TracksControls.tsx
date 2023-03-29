import React, { FC, useEffect } from "react";
import { ActionIcon, Box, Flex, TextInput } from "@mantine/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    resetTracksToDefaults,
    setTracksCardGap,
    setTracksCardSize,
    setTracksFilterText,
    setTracksLyricsSearchText,
    setTracksShowDetails,
} from "../../app/store/userSettingsSlice";
import { RootState } from "../../app/store/store";
import { useGetTracksQuery } from "../../app/services/vibinTracks";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import CardControls from "../shared/CardControls";
import FilterInstructions from "../shared/FilterInstructions";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSquareX } from "@tabler/icons";
import ShowCountLabel from "../shared/ShowCountLabel";
import PlayMediaIdsButton from "../shared/PlayMediaIdsButton";
import CurrentlyPlayingButton from "../shared/CurrentlyPlayingButton";

const lyricsSearchFinder = new RegExp(/(lyrics?):(\([^)]+?\)|[^( ]+)/);
const stripParens = new RegExp(/^\(?([^\)]+)\)?$/);

type TracksControlsProps = {
    scrollToCurrent?: () => void;
}

const TracksControls: FC<TracksControlsProps> = ({ scrollToCurrent }) => {
    const dispatch = useAppDispatch();
    const { CARD_FILTER_WIDTH, STYLE_LABEL_BESIDE_COMPONENT } = useAppGlobals();
    const { data: allTracks } = useGetTracksQuery();
    const { cardSize, cardGap, filterText, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.tracks
    );
    const { filteredTrackMediaIds } = useAppSelector((state: RootState) => state.internal.tracks);
    const [debouncedFilterText] = useDebouncedValue(filterText, 250);

    // If the filter text includes something like "lyric:(some lyric search)" then store
    // "some lyric search" in application state.
    useEffect(() => {
        const lyricSearch = debouncedFilterText.toLocaleLowerCase().match(lyricsSearchFinder);

        if (lyricSearch) {
            const searchNoParens = lyricSearch[2].match(stripParens);

            dispatch(
                setTracksLyricsSearchText(searchNoParens ? searchNoParens[1] : lyricSearch[2])
            );
        } else {
            dispatch(setTracksLyricsSearchText(""));
        }
    }, [debouncedFilterText, dispatch]);

    return (
        <Flex gap={25} align="center">
            {/* Filter text */}
            {/* TODO: Consider debouncing setTracksFilterText() if performance is an issue */}
            <Flex gap={10} align="center">
                <TextInput
                    placeholder="Title filter, or advanced"
                    label="Filter"
                    value={filterText}
                    rightSection={
                        <ActionIcon
                            disabled={!filterText}
                            onClick={() => dispatch(setTracksFilterText(""))}
                        >
                            <IconSquareX size="1.3rem" style={{ display: "block", opacity: 0.5 }} />
                        </ActionIcon>
                    }
                    onChange={(event) => dispatch(setTracksFilterText(event.target.value))}
                    styles={{
                        ...STYLE_LABEL_BESIDE_COMPONENT,
                        wrapper: {
                            width: CARD_FILTER_WIDTH,
                        },
                    }}
                />

                <FilterInstructions
                    defaultKey="title"
                    supportedKeys={["title", "album", "artist", "genre", "date", "lyrics"]}
                    examples={[
                        "favorite track",
                        "brick artist:(the eager) date:2004",
                        "lyrics:(crazy diamond)",
                    ]}
                    note={
                        "Lyrics searches are limited to tracks which have already had their " +
                        "lyrics retrieved by the Vibin backend."
                    }
                />
            </Flex>

            <Flex>
                <CurrentlyPlayingButton onClick={() => scrollToCurrent && scrollToCurrent()} />

                <Box pl={15}>
                    <PlayMediaIdsButton
                        mediaIds={filteredTrackMediaIds}
                        tooltipLabel={`Replace Playlist with ${filteredTrackMediaIds.length.toLocaleString()} filtered Tracks (100 max)`}
                        notificationLabel={`Playlist replaced with ${filteredTrackMediaIds.length.toLocaleString()} filtered Tracks`}
                        maxToPlay={100}
                    />
                </Box>
            </Flex>

            <Flex gap={20} justify="right" sx={{ flexGrow: 1, alignSelf: "flex-end" }}>
                {/* "Showing x of y tracks" */}
                <ShowCountLabel
                    showing={filteredTrackMediaIds.length}
                    of={allTracks?.length || 0}
                    type="tracks"
                />

                {/* Card display settings */}
                <CardControls
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                    cardSizeSetter={setTracksCardSize}
                    cardGapSetter={setTracksCardGap}
                    showDetailsSetter={setTracksShowDetails}
                    resetter={resetTracksToDefaults}
                />
            </Flex>
        </Flex>
    );
};

export default TracksControls;

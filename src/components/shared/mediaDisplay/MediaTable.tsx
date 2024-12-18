import React, { FC, ReactElement, Ref, useEffect, useState } from "react";
import { Box, createStyles, Flex, MantineColor, Stack, Text, useMantineTheme } from "@mantine/core";
import VisibilitySensor from "react-visibility-sensor";

import { useAppSelector } from "../../../app/hooks/store";
import { Media, MediaId } from "../../../app/types";
import { RootState } from "../../../app/store/store";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { secstoHms } from "../../../app/utils";
import FavoriteIndicator from "../buttons/FavoriteIndicator";
import MediaArt from "./MediaArt";
import MediaActionsButton from "../buttons/MediaActionsButton";
import PlayButton from "../buttons/PlayButton";
import WarningBanner from "../textDisplay/WarningBanner";
import NumericSwatch from "../dataDisplay/NumericSwatch";

// ================================================================================================
// Show an array of Media items in a table.
// ================================================================================================

const ART_SIZE = 35;

type ColumnConfiguration = {
    [key: string]: {
        heading?: string;
        valueGenerator?: (value: any, media: Media) => any;
        justify?: "left" | "right" | "center";
    };
};

type TableRowProps = {
    mediaItem: Media;
    columnConfig: ColumnConfiguration;
    columnsToDisplay: string[];
    currentlyPlayingId?: MediaId | number;
    currentlyPlayingRef?: Ref<HTMLDivElement>;
};

/**
 * Get the value to display in the given column for the given media item.
 */
const columnValueGetter = (
    media: Media,
    columnConfig: ColumnConfiguration,
    column: string,
): any => {
    if (!media.hasOwnProperty(column)) {
        return "";
    }

    const valueGenerator = columnConfig[column]?.valueGenerator;

    // @ts-ignore
    return valueGenerator ? valueGenerator(media[column], media) : media[column];
};

/**
 * Render a single table row. Use visibility sensing to only fully render the row cells when the
 * row is visible.
 */
const TableRow: FC<TableRowProps> = ({
    mediaItem,
    columnConfig,
    columnsToDisplay,
    currentlyPlayingId,
    currentlyPlayingRef,
}) => {
    const [, setIsVisible] = useState<boolean>(false);

    return (
        <VisibilitySensor
            onChange={setIsVisible}
            partialVisibility={true}
            offset={{ top: -1000, bottom: -1000 }}
        >
            {({ isVisible }: { isVisible: boolean }) =>
                isVisible ? (
                    <tr>
                        {columnsToDisplay.map((column, index) => (
                            // Wrap the "currently playing" row in a Box with the currentlyPlayingRef
                            <td
                                key={`${mediaItem.id}::${index}`}
                                // @ts-ignore
                                style={{ textAlign: columnConfig[column].justify }}
                            >
                                {index === 0 &&
                                currentlyPlayingRef &&
                                currentlyPlayingId === mediaItem.id ? (
                                    <Box ref={currentlyPlayingRef}>
                                        {columnValueGetter(mediaItem, columnConfig, column)}
                                    </Box>
                                ) : (
                                    columnValueGetter(mediaItem, columnConfig, column)
                                )}
                            </td>
                        ))}
                    </tr>
                ) : (
                    <tr>
                        <td>
                            <Box mih={ART_SIZE}></Box>
                        </td>
                    </tr>
                )
            }
        </VisibilitySensor>
    );
};

// ================================================================================================

const useStyles = createStyles((theme) => ({
    table: {
        borderCollapse: "collapse",
        width: "fit-content",
        thead: {
            fontWeight: "bold",
            borderBottom: "1px solid rgb(0, 0, 0, 0)",
            "td::first-letter": {
                textTransform: "capitalize",
            },
        },
        "tbody > tr": {
            backgroundColor: theme.colorScheme === "dark" ? "#1c1f22" : "#e4e8e6",
            height: "1lh",
        },
        "tbody > tr:not(:first-of-type)": {
            borderTop: `1px solid ${theme.colors.gray[8]}`,
        },
        "tbody > tr:not(:last-of-type)": {
            borderBottom: `1px solid ${theme.colors.gray[8]}`,
        },
        td: {
            fontSize: 14,
            paddingLeft: 0,
            paddingRight: 50,
            paddingTop: 4,
            paddingBottom: 4,
        },
        "td:first-of-type": {
            paddingLeft: 15,
        },
        "td:last-of-type": {
            paddingRight: 20,
        },
    },
}));

// ------------------------------------------------------------------------------------------------

type MediaTableProps = {
    media: Media[];
    columns: string[];
    stripeColor?: MantineColor;
    currentlyPlayingId?: MediaId | number; // NOTE: Presets have numeric ids
    currentlyPlayingRef?: Ref<HTMLDivElement>;
};

const MediaTable: FC<MediaTableProps> = ({
    media = [],
    columns = [],
    stripeColor,
    currentlyPlayingId,
    currentlyPlayingRef,
}) => {
    const { colors } = useMantineTheme();
    const { CURRENTLY_PLAYING_COLOR, MAX_TABLE_ITEMS_TO_DISPLAY } = useAppGlobals();
    const { classes } = useStyles();
    const currentSource = useAppSelector(
        (state: RootState) => state.system.streamer.sources?.active,
    );
    const [mediaToDisplay, setMediaToDisplay] = useState<{ isTruncated: boolean; media: Media[] }>({
        isTruncated: false,
        media: [],
    });

    /**
     * Restrict the number of rows displayed to MAX_ITEMS_TO_DISPLAY.
     */
    useEffect(() => {
        if (!media) {
            setMediaToDisplay({ isTruncated: false, media: [] });
        }

        if (media.length <= MAX_TABLE_ITEMS_TO_DISPLAY) {
            setMediaToDisplay({ isTruncated: false, media });
        } else {
            setMediaToDisplay({
                isTruncated: true,
                media: media.slice(0, MAX_TABLE_ITEMS_TO_DISPLAY),
            });
        }
    }, [media, MAX_TABLE_ITEMS_TO_DISPLAY]);

    const isPlayingMediaWithKnownId =
        currentSource?.class && ["stream.media", "stream.radio"].includes(currentSource?.class);
    const currentEntryBorderColor = isPlayingMediaWithKnownId
        ? CURRENTLY_PLAYING_COLOR
        : colors.gray[7];
    const columnsToDisplay = [...columns, "controls"];

    // --------------------------------------------------------------------------------------------

    const { classes: dynamicClasses } = createStyles((theme) => {
        // The table will always have a stripe color.
        const tableCSS: Record<string, any> = {
            table: {
                "tbody > tr:nth-of-type(odd)": {
                    backgroundColor: stripeColor
                        ? stripeColor
                        : theme.colorScheme === "dark"
                          ? theme.colors.dark[7]
                          : theme.colors.gray[2],
                },
            },
        };

        // Define the CSS for the row representing the currently-playing media item. This CSS
        // defines a box and background color for the row.

        // The bottom border of the row *above* the currently-playing row is used to draw the
        // top of the box around the currently-playing row.
        const previousRowCSS = {
            borderBottom: `1px solid ${currentEntryBorderColor} !important`,
        };

        // The currently-playing row owns the left, right, and bottom of the currently-playing box,
        // as well as the box background color.
        const currentlyPlayingRowCSS = {
            color: theme.white,
            backgroundColor:
                theme.colorScheme === "dark" ? "rgb(70, 70, 70, 0.5)" : theme.colors.yellow[6],
            border: `1px solid ${currentEntryBorderColor} !important`,
        };

        // Attach the currently-playing CSS if the currently-playing row is visible.
        if (media[0] && currentlyPlayingId === media[0].id) {
            // Handle the case of the "previous row" being the table header.
            tableCSS.table = {
                ...tableCSS.table,
                "thead > tr": previousRowCSS,
                "tbody > tr:nth-of-type(1)": currentlyPlayingRowCSS,
            };
        } else {
            // The previous row is a normal table row.
            const currentlyPlayingRowIndex = media.findIndex(
                (mediaItem) => mediaItem.id === currentlyPlayingId,
            );

            if (currentlyPlayingRowIndex) {
                tableCSS.table = {
                    ...tableCSS.table,
                    [`tbody > tr:nth-of-type(${currentlyPlayingRowIndex})`]: previousRowCSS,
                    [`tbody > tr:nth-of-type(${currentlyPlayingRowIndex + 1})`]:
                        currentlyPlayingRowCSS,
                };
            }
        }

        return tableCSS;
    })();

    // --------------------------------------------------------------------------------------------

    // Configure the header and value generators for each potential field from a media item.
    const columnConfig: ColumnConfiguration = {
        album: {
            heading: "album",
        },
        albumId: {
            heading: "album id",
        },
        album_art_uri: {
            heading: "",
            valueGenerator: (value: any, media: Media): ReactElement => {
                return (
                    <MediaArt
                        media={media}
                        radius={3}
                        size={ART_SIZE}
                        fit="scale-down"
                        showActions={false}
                        showFavoriteIndicator={false}
                        showPlayButton={true}
                        centerPlayButton={true}
                        playButtonSize={27}
                    />
                );
            },
        },
        art_url: {
            heading: "",
            valueGenerator: (value: any, media: Media): ReactElement => {
                return (
                    <MediaArt
                        media={media}
                        radius={3}
                        size={ART_SIZE}
                        fit="scale-down"
                        showActions={false}
                        showPlayButton={true}
                        centerPlayButton={true}
                        playButtonSize={27}
                    />
                );
            },
        },
        artist: {
            heading: "artist",
        },
        class: {
            heading: "class",
        },
        controls: {
            heading: "",
            valueGenerator: (value: any, media: Media): ReactElement => {
                return (
                    <Flex gap={10} align="center">
                        <PlayButton media={media} size={20} />
                        <MediaActionsButton media={media} size={10} />
                        <FavoriteIndicator media={media} />
                    </Flex>
                );
            },
        },
        creator: {
            heading: "creator",
        },
        duration: {
            heading: "duration",
            justify: "right",
            valueGenerator: (value: any, media: Media): string => secstoHms(value),
        },
        genre: {
            heading: "genre",
            valueGenerator: (value: any): string =>
                !value || value.includes("Unknown") ? "" : value,
        },
        id: {
            heading: "ID",
            justify: "center",
            valueGenerator: (value: any): any =>
                typeof value === "number" ? <NumericSwatch number={value} /> : value,
        },
        is_playing: {
            heading: "playing",
        },
        name: {
            heading: "name",
        },
        parentId: {
            heading: "parent",
        },
        state: {
            heading: "state",
        },
        title: {
            heading: "title",
        },
        track_number: {
            heading: "track",
        },
        type: {
            heading: "type",
        },
        year: {
            heading: "year",
            justify: "right",
        },
    };

    // Define table header
    const headerRow = (
        <tr>
            {columnsToDisplay.map((column) => (
                <td key={`header::${column}`} style={{ textAlign: columnConfig[column].justify }}>
                    {columnConfig[column]?.heading}
                </td>
            ))}
        </tr>
    );

    // Define table body
    const bodyRows = mediaToDisplay.media
        .map((mediaItem) => ({ ...mediaItem, controls: undefined }))
        .map((mediaItem) => (
            <TableRow
                key={mediaItem.id}
                mediaItem={mediaItem}
                columnConfig={columnConfig}
                columnsToDisplay={columnsToDisplay}
                currentlyPlayingId={currentlyPlayingId}
                currentlyPlayingRef={currentlyPlayingRef}
            />
        ));

    // --------------------------------------------------------------------------------------------

    return (
        <Stack>
            {mediaToDisplay.isTruncated && (
                <WarningBanner>
                    <Text>{`Table limited to ${MAX_TABLE_ITEMS_TO_DISPLAY} rows for speed.`}</Text>
                </WarningBanner>
            )}

            <table className={`${classes.table} ${dynamicClasses.table}`}>
                <thead>{headerRow}</thead>
                <tbody>{bodyRows}</tbody>
            </table>
        </Stack>
    );
};

export default MediaTable;

import { createElement, ReactNode } from "react";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import get from "lodash/get";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

import { Playlist, QueueItem } from "./types";
import { MediaSortDirection } from "./store/userSettingsSlice";

// ================================================================================================
// Various utility functions.
// ================================================================================================

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

/**
 *
 * TODO: This (ensuring consistent data types for the same concept) would ideally be done in the
 * backend.
 *
 * @param hms
 */
export const hmsToSecs = (hms: string): number => {
    const [hh, mm, ss] = hms.split(":");

    return parseFloat(hh) * 60 * 60 + parseFloat(mm) * 60 + parseFloat(ss);
};

/**
 * Convert the given duration in seconds to "hh:mm:ss", stripping the hours if they're "00:". So
 * "00:03:12" becomes "3:12".
 */
export const secstoHms = (duration: number): string => {
    if (!duration) {
        return "0:00";
    }

    let hms: string = new Date(duration * 1000)
        .toISOString()
        .substring(11, 19)
        .replace(/^00:0?/, "");

    return hms;
};

/**
 * Determines the width, in pixels, required to render the given text.
 *
 * TODO: Investigate if/how this works for different font sizes.
 */
export const getTextWidth = (text: string): number => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
        context.font = getComputedStyle(document.body).font;
        return context.measureText(text).width;
    }

    return 0;
};

/**
 * Convert a unix time (in seconds) to a string, like "August 16, 2018 8:02 PM".
 */
export const epochSecondsToString = (seconds: number) => dayjs.unix(seconds).format("lll");

/**
 * Convert a unix time (in seconds) to a relative offset string, like "5 days ago".
 */
export const epochSecondsToStringRelative = (seconds: number) => dayjs.unix(seconds).fromNow();

/**
 * Return the year component (as a number) from a provided date string, e.g. "2023-01-01" will
 * return 2023. Returns undefined if the year cannot be determined.
 */
export const yearFromDate = (date: string): number | undefined => {
    const year = new Date(Date.parse(date)).getUTCFullYear();

    if (isNaN(year)) {
        return undefined;
    }

    return year;
};

interface VibinNotification {
    id?: string;
    title?: string;
    message?: string;
    color?: string;
    icon?: ReactNode;
    loading?: boolean;
    autoClose?: boolean;
}

/**
 * Show a success notification.
 */
export const showSuccessNotification = ({
    id,
    title,
    message,
    color,
    icon,
    loading = false,
    autoClose = true,
}: VibinNotification) =>
    showNotification({
        id,
        title,
        message,
        color: color || "teal",
        icon: icon || createElement(IconCheck, { size: 18 }),
        loading,
        autoClose,
    });

/**
 * Show a warning notification.
 */
export const showWarningNotification = ({
    id,
    title,
    message,
    color,
    icon,
    loading = false,
    autoClose = true,
}: VibinNotification) =>
    showNotification({
        id,
        title,
        message,
        color: color || "yellow",
        icon:
            icon ||
            createElement(IconAlertCircle, {
                size: 21,
                style: { paddingRight: 1, paddingBottom: 2 },
            }),
        loading,
        autoClose,
    });

/**
 * Show an error notification.
 */
export const showErrorNotification = ({
    id,
    title,
    message,
    color,
    icon,
    loading = false,
    autoClose = false,
}: VibinNotification) =>
    showNotification({
        id,
        title,
        message,
        color: color || "red",
        icon: icon || createElement(IconX, { size: 18 }),
        loading,
        autoClose,
    });

// TODO: This does not need to be specific to playlists. It would be nice to have it support arrays
//  Of any object with a "duration" key (e.g. Track). Currently Track and PlaylistEntry have
//  different duration formats, which would ideally be standardized in the back end first.
// TODO: Remove
/**
 * Compute the duration (in seconds) of the given Playlist.
 */
export const playlistDuration = (playlist: Playlist) =>
    playlist.reduce((totalDuration, entry) => totalDuration + hmsToSecs(entry.duration), 0);

// TODO: This does not need to be specific to playlists. It would be nice to have it support arrays
//  Of any object with a "duration" key (e.g. Track). Currently Track and PlaylistEntry have
//  different duration formats, which would ideally be standardized in the back end first.
/**
 * Compute the duration (in seconds) of the given Queue.
 */
export const queueItemsDuration = (items: QueueItem[]) =>
    items.reduce((totalDuration, item) => totalDuration + (item.metadata?.duration ?? 0), 0);

const filterTokenizerRegex = /(\S+):(\([^)]+?\)|[^( ]+)/g;
const parentStripperRegex = /^\(?(.*?)\)?$/;
const emptyStringRegex = /^\s*$/;

/**
 * Take a given obj, which can be a nested object of arbitrary depth, and return an array of all
 * key names flattened in dot notation. e.g:
 *
 * {
 *     grandparent: {
 *         parent1: {
 *             child1: 10,
 *             child2: 10,
 *         },
 *         parent2: "foo",
 *     }
 * }
 *
 * ... will return:
 *
 * ["grandparent.parent1.child1"], "grandparent.parent1.child2", "grandparent.parent2"].
 */
const flattenKeys = (obj: { [key: string]: any }, prefix = ""): string[] => {
    let result: string[] = [];

    for (let key in obj) {
        const flattenedKey = `${prefix}${key}`;

        if (obj.hasOwnProperty(key)) {
            if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
                result = [...result, ...flattenKeys(obj[key], `${flattenedKey}.`)];
            } else {
                result.push(flattenedKey);
            }
        }
    }

    return result;
};

/**
 * Determine which objects in the collection match the given filterText.
 *
 * Example filterText:
 *
 *  - "some text"
 *  - "genre:jazz"
 *  - "lyrics:(not the one) artist:cars"
 *  - "mood date:2012 genre:electronic"
 *
 * Filter keys and values are input as "key:value". The key is expected to be a key on the objects
 * in the collection (e.g. Album has a "genre" key). Multiple keys can be specified. Multi-word
 * values are specified using parentheses. Any text which is not associated with a key is assumed
 * to be associated with the default key.
 *
 * @param collection An array of Artists, Tracks, etc.
 * @param filterText The text filter to apply.
 * @param defaultKey The key to apply the filter to, if the key is not explicitly stated.
 * @param searchRoot The root of each item/object in the collection under which to search. e.g. If
 *  each collection item is an object with a "media" key which contains the fields to search, then
 *  specify a searchRoot of "media".
 */
export function collectionFilter<T extends Object>(
    collection: T[],
    filterText: string,
    defaultKey: string = "",
    searchRoot?: string,
): T[] {
    if (collection.length <= 0 || filterText.match(emptyStringRegex)) {
        return collection;
    }

    const filterTextLowerCase = filterText.toLocaleLowerCase();

    const matches = [...filterTextLowerCase.matchAll(filterTokenizerRegex)];

    // If the "key" in any "key:value" is invalid (i.e. it's not a key in any of the items in the
    // collection, then treat this as a zero-match result.
    const validMatches = matches.filter((match) =>
        collection.some((item) =>
            flattenKeys(item).includes(searchRoot ? `${searchRoot}.${match[1]}` : match[1]),
        ),
    );

    if (validMatches.length !== matches.length) {
        return [];
    }

    const foundKeys: string[] = [];

    // Extract just the key/value pairs from the match groups. Strip parens from any values, so
    // that "(multi-word search)" becomes "multi-word search".
    const matchKeyValues = validMatches.map(([_, thisKey, thisValue]) => {
        foundKeys.push(thisKey);

        return [thisKey, thisValue.replace(parentStripperRegex, "$1")];
    });

    // Check for any text not associated with a key. If any such text is found, then associate it
    // with the defaultKey. An explicit use of defaultKey in the filterText will override this.
    //
    // e.g. "some text key:value" will be interpreted as "defaultKey:(some text) key:value"; but
    //      "some text defaultKey:value" will be interpreted as "defaultKey:value".
    const unkewordedText = filterTextLowerCase
        .replace(filterTokenizerRegex, "")
        .replace(emptyStringRegex, "");

    if (unkewordedText !== "" && defaultKey !== "" && !foundKeys.includes(defaultKey)) {
        matchKeyValues.push([defaultKey, unkewordedText.trim()]);
    }

    // Find any items in the collection which contain the searched-for key/value pairs. This is an
    // "AND" search; and matching is a case-insensitive partial text match.
    return collection.filter((item) => {
        for (const [key, searchValue] of matchKeyValues) {
            let thisValue = get(item, searchRoot ? `${searchRoot}.${key}` : key); // Using lodash to support "nested.key.names".

            if (typeof thisValue === "undefined") {
                return false;
            } else if (
                typeof thisValue === "string" &&
                !thisValue.toLocaleLowerCase().includes(searchValue)
            ) {
                return false;
            } else if (typeof thisValue === "number" && thisValue !== parseFloat(searchValue)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Sorter factory, to sort the given collection by field name.
 *
 * Returns a function which can passed to an array's sort() function.
 */
export function collectionSorter<T extends Record<string, any>>(
    field: string,
    direction: MediaSortDirection = "ascending",
) {
    const lessThanCheck = direction === "ascending" ? -1 : 1;
    const greaterThanCheck = direction === "ascending" ? 1 : -1;

    return (a: T, b: T) => {
        // Using lodash to support "nested.field.names"
        let aValue = get(a, field);
        let bValue = get(b, field);

        if (typeof aValue === "undefined" || typeof bValue === "undefined") {
            return 0;
        }

        aValue = typeof aValue === "string" ? aValue.toUpperCase() : aValue;
        bValue = typeof bValue === "string" ? bValue.toUpperCase() : bValue;

        if (aValue < bValue) {
            return lessThanCheck;
        }
        if (aValue > bValue) {
            return greaterThanCheck;
        }

        return 0;
    };
}

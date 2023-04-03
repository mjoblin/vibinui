import React, { ReactNode } from "react";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// TODO: Write tests

export const isDev = process.env.NODE_ENV === "development";

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
}

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
        icon: icon || IconCheck({ size: 18 }),
        loading,
        autoClose,
    });

/**
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
        icon: icon || IconX({ size: 18 }),
        loading,
        autoClose,
    });


const filterTokenizerRegex = /(\S+):(\([^)]+?\)|[^( ]+)/g;
const parentStripperRegex = /^\(?(.*?)\)?$/;
const emptyStringRegex = /^\s*$/;

/**
 *
 * @param collection
 * @param filterText
 * @param defaultKey
 */
export function collectionFilter<T extends Object>(
    collection: T[],
    filterText: string,
    defaultKey: string = "",
): T[] {
    if (collection.length <= 0 || filterText.match(emptyStringRegex)) {
        return collection;
    }

    const matches = [...filterText.toLocaleLowerCase().matchAll(filterTokenizerRegex)];

    // Ignore any "key:value" where the "key" is not a key in any of the items in the collection.
    const validMatches = matches.filter((match) =>
        collection.some((item) => Object.keys(item).includes(match[1]))
    );

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
    const unkewordedText = filterText
        .replace(filterTokenizerRegex, "")
        .toLocaleLowerCase()
        .replace(emptyStringRegex, "");

    if (unkewordedText !== "" && defaultKey !== "" && !foundKeys.includes(defaultKey)) {
        matchKeyValues.push([defaultKey, unkewordedText.trim()]);
    }

    // Find any items in the collection which contain the searched-for key/value pairs. This is an
    // "AND" search; and matching is a case-insensitive partial text match.
    return collection.filter((item) => {
        for (const [key, value] of matchKeyValues) {
            // @ts-ignore
            if (key in item && !item[key].toLocaleLowerCase().includes(value)) {
                return false;
            }
        }

        return true;
    });
}
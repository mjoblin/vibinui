import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// TODO: Write tests

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
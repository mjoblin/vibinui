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
}
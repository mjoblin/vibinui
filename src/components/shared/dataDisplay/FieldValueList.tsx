import React, { FC, ReactNode } from "react";
import { createStyles } from "@mantine/core";

interface FieldValueListProps {
    fieldValues: {
        [key: string]: string | number | boolean | ReactNode;
    };
    keySize?: number;
    keyFontFamily?: string;
    keyColor?: string;
    keyWeight?: React.CSSProperties["fontWeight"];
    valueSize?: number;
    valueFontFamily?: string;
    valueColor?: string;
    valueWeight?: React.CSSProperties["fontWeight"];
    columnGap?: number;
    rowHeight?: number;
}

const FieldValueList: FC<FieldValueListProps> = ({
    fieldValues,
    keySize = 14,
    keyColor,
    keyFontFamily = "",
    keyWeight = "normal",
    valueSize = 14,
    valueColor,
    valueFontFamily = "",
    valueWeight = "bold",
    columnGap = 5,
    rowHeight = 1.1,
}) => {
    // TODO: Figure out why fontWeight is causing TS to complain
    // @ts-ignore
    const { classes: dynamicClasses } = createStyles((theme) => ({
        table: {
            "td:first-of-type": {
                textAlign: "end",
                fontFamily: keyFontFamily,
                lineHeight: rowHeight,
                color: keyColor || theme.colors.dark[3],
                fontSize: keySize,
                fontWeight: keyWeight,
                paddingRight: columnGap,
            },
            "td:last-of-type": {
                fontFamily: valueFontFamily,
                lineHeight: rowHeight,
                color: valueColor || theme.colors.dark[1],
                fontSize: valueSize,
                fontWeight: valueWeight,
            },
        },
    }))();

    return (
        <div className="FieldValueListContainer">
            <table className={dynamicClasses.table}>
                <tbody>
                    {Object.entries(fieldValues).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>
                                {typeof value === "boolean" ? (value ? "true" : "false") : value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FieldValueList;

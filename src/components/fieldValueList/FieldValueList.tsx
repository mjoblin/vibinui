import React, { FC } from "react";

import "./FieldValueList.css";

interface FieldValueListProps {
    fieldValues: {
        [key: string]: string | number | boolean;
    };
}

const FieldValueList: FC<FieldValueListProps> = ({ fieldValues }) => {
    return (
        <div className="FieldValueListContainer">
            <table>
                <tbody>
                    {Object.entries(fieldValues).map(([key, value]) => (
                        <tr key={key}>
                            <td className="Field">{key}</td>
                            <td className="Value">
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

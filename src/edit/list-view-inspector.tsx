import React from "react";
import { RangeControl } from "@wordpress/components";
import { useResultViewInfoContext } from "./context";
import { __ } from "@wordpress/i18n";

export const ListViewInspector = () =>
{
    const { listviewHeight, setListViewHeight } = useResultViewInfoContext();

    return (
        <RangeControl
            label={__('Data grid height', 'query-search')}
            __nextHasNoMarginBottom={true}
            min={300}
            max={1600}
            initialPosition={400}
            value={listviewHeight}
            onChange={setListViewHeight}
            />
    )
}

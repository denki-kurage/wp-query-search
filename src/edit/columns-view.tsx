import React from "react"
import { CheckboxControl } from "@wordpress/components";
import { useResultViewInfoContext } from "./context";



export const ColumnsView = ({columns}) =>
{
	const { selectedColumns, changeColumns } = useResultViewInfoContext();

	const checkChange = (column, checked) =>
	{
		const s = new Set(selectedColumns);
		checked ? s.add(column) : s.delete(column);
		changeColumns([...s.values()]);
	};

	// __nextHasNoMarginBottomが効かないのでcomponents-base-controlを乗っ取る。
	return (
		<div style={{ overflow: "scroll", maxHeight: "50em" }}>
			{columns.map((column) => (
				<div key={column} className="components-base-control" style={{ marginBottom: ".1em" }}>
					<CheckboxControl
						__nextHasNoMarginBottom={true}
						label={column}
						key={column}
						checked={selectedColumns.includes(column)}
						onChange={checked => checkChange(column, checked)}
						/>
				</div>
			))}
		</div>
	)
}



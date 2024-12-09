import React, { useMemo } from "react"
import { useInputFormContext } from "../../base-components/input-forms";
import { __ } from "@wordpress/i18n";

export default ({ attributes }) =>
{
	const { Options } = useInputFormContext();
	const { enumList = {} } = attributes;

	const eoptions = Array.isArray(enumList) ? enumList.map(v => ({ value: v, label: v })) :
		[...Object.entries(enumList)].map(v => ({ value: v[0], label: v[1] }));

	return (
		<>
			<Options name="query" options={eoptions}  />

			<OptionsEdit enumList={enumList} />
		</>
	)
}

const OptionsEdit = ({enumList}) =>
{
	const { ArrayList, Hash } = useInputFormContext();
	const Component = useMemo(() => Array.isArray(enumList) ? ArrayList : Hash, [enumList])

	return (
		<div className="modal-key-value-editor-containe">
			<Component name="enumList" label={__('Edit item', 'query-search')} />
		</div>
	)

}

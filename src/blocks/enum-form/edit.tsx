import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";
import { __ } from "@wordpress/i18n";


export default ({ attributes }) =>
{
	const { Select } = useInputFormContext();
	const { enumList: items, field = '' } = attributes;

	const options = Array.isArray(items) ? items.map(e => ({value: e, label: e})) : [...Object.entries(items)].map(v => ({value: v[0], label: v[1]}));

	
	return (
		<div>
			<Select name="query" label={field} options={options} />

			<OptionsEdit />

		</div>
	)
};


const OptionsEdit = ({}) =>
{
	const { ArrayList } = useInputFormContext();

	return (
		<div className="modal-key-value-editor-containe">
			<ArrayList name="enumList" label={__('Edit item', 'query-search')} />
		</div>
	)

}

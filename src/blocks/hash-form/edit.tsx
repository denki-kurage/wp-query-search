import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";
import { __ } from "@wordpress/i18n";

export default ({ attributes }) =>
{
	const { Hash, Boolean } = useInputFormContext();
	const { viewTable = false } = attributes;

	return (
		<>
			<Boolean name="viewTable" label={__('Show list', 'query-search')} />
		
			<Hash name="query" label={__('Edit list', 'query-search')} viewTable={viewTable} />
		</>
	)
}

import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";

export default (props) =>
{
	const { Boolean } = useInputFormContext();
	const field = props?.attributes?.field ?? '';

	return (
		<Boolean name="query" label={field} />
	)
};

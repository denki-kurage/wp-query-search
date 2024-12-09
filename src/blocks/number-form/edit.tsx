import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";

export default (props) =>
{
	const { Number } = useInputFormContext();
	const field = props?.attributes?.field ?? '';

	return (
		<Number name="query" label={field} />
	)
};

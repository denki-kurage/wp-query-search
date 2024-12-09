import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";

export default (props) =>
{
	const { DateTime } = useInputFormContext();
	const field = props?.attributes?.field ?? '';

	return (
		<>
			<DateTime name="query" label={field} />
		</>
	)
};

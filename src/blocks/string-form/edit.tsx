import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";


export default (props) =>
{
	const { Text } = useInputFormContext();
	const field = props?.attributes?.field ?? '';

	return (
		<>
			<Text name="query" label={field} />
		</>
	)
};

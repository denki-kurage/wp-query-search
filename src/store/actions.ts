
export const setResultViewName = (rvName: string) =>
{
	return ({
		type: 'SET_RESULT_VIEW_NAME',
		name: rvName
	})
}

export const addQueryFormName = (qfName: string) =>
{
	return ({
		type: 'ADD_QUERY_FORM_NAME',
		name: qfName
	})
}

export const setExtensionMode = (enabled: boolean) =>
{
	return ({
		type: 'SET_EXTENSION_MODE',
		enabled
	})
}

export const setEndpointOption = (kind: string, name: string, option: any) =>
{
	return ({
		type: 'SET_ENDPOINT_OPTION',
		kind,
		name,
		option
	})
}

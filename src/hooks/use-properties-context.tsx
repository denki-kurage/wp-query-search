import { useMemo, useState } from "@wordpress/element";
import React, { useCallback } from "react";




export const useAttributePropertiesContextValue = ( attributes, setAttributes ) =>
{
	return useMemo(() => {
		return ({
			properties: attributes,
			setProperty: (n, v) => setAttributes({[n]: v}),
			setProperties: (v) => setAttributes({ ...v })
		})
	}, [attributes, setAttributes]);
}

export const useReferencePropertyContextValue = (properties, setProperties) =>
{
	return useMemo(() => {
		return ({
			properties: properties,
			setProperty: (n, v) => setProperties(Object.assign(properties, {[n]: v})),
			setProperties: v => setProperties(Object.assign(properties, v))
		})
	}, [properties]);
}


export const useStatePropertiesContextValue = (defaultValue = {}) =>
{
	const [obj, setObj] = useState(defaultValue);
	const [func] = useState({ setProperties: (v) => {} })

	func.setProperties = (value) => {
		setObj({ ...obj, ...value });
	};

	const setProperties = useCallback(v => func.setProperties(v), [func])
	const setProperty = useCallback((k, v) => func.setProperties({ [k]: v }) , [func])

	// properties, setProperties 共に更新されてしまう点に注意
	return useMemo(() => ({ properties: obj, setProperties, setProperty }), [obj]);
}



export const useStatePropertiesContextValue2 = (defaultValue = {}) =>
{
	const [obj, setObj] = useState(defaultValue);
	const [func] = useState({ execute: () => {} })

	const setProperties = useCallback((value) => {
		setObj({ ...obj, ...value });
	}, [obj]);

	// properties, setProperties 共に更新されてしまう点に注意
	return useMemo(() => ({ properties: obj, setProperties }), [obj]);
}




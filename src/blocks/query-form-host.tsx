import { useSelect } from "@wordpress/data"
import React, { createContext, useContext } from "react";
import { PropertyContextProvider } from "../base-components/input-forms-property-context";
import { useAttributePropertiesContextValue } from "../hooks/use-properties-context";
import { useMemo } from "@wordpress/element"
import { useQueryFormComposeContext } from "./blocks-context";


const ParentQueryFormContext = createContext<any>(null);
export const { Provider: ParentQueryFormProvider } = ParentQueryFormContext;
export const useParentQueryFormContext = () => useContext(ParentQueryFormContext);

const defFunc = v => v;



export const QueryFormHost = (props) =>
{
	const { name, attributes, setAttributes, clientId } = props;

	const pv = useAttributePropertiesContextValue(attributes, setAttributes);

	// @ts-ignore
	const blockType = useSelect(s => s('core/blocks').getBlockType(name), []);
	const Component = blockType?.edit;

	
    const getComposes = useQueryFormComposeContext();
    const { selfCompose, childrenCompose } = getComposes(clientId);
	const parentCompose = useParentQueryFormContext();

	
	const WrapedComponent: any = useMemo(() => {
		const p = parentCompose || defFunc;
		const s = selfCompose || defFunc;
		return Component ? p(s(Component)) : undefined;
	}, [selfCompose, parentCompose])

	if(!WrapedComponent)
	{
		return null;
	}


	return (
		<PropertyContextProvider value={pv}>
			<ParentQueryFormProvider value={childrenCompose}>
				<WrapedComponent {...props} />
			</ParentQueryFormProvider>
		</PropertyContextProvider>
	)
}

export default QueryFormHost;

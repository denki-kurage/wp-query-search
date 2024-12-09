import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import React from "react";
import { useSelect } from "@wordpress/data";
import { store } from "../store";
import { withQueryBlockCompose } from "../blocks/hoc";
import { PropertyContextProvider } from "../base-components/input-forms-property-context";
import { useAttributePropertiesContextValue } from "../hooks/use-properties-context";
import { createInputFormComponents, InputComponentsContextProvider } from "../base-components/input-forms";
import { useMemo } from "@wordpress/element";

const components = createInputFormComponents();

const withCp = createHigherOrderComponent(BlockEdit => props => {
	
	const { name, attributes, setAttributes } = props;
	const { getQuerySearchBlockNames, getQueryFormNames } = useSelect(s => s(store), []);
	const blockNames = getQuerySearchBlockNames();
	const queryFormNames = getQueryFormNames();
	const pv = useAttributePropertiesContextValue(attributes, setAttributes);

	

	if( blockNames.includes(name) )
	{
		// ブロックはwithQueryFormBlock()を追加する
		const WrapBlockEdit: any = queryFormNames.includes(name) ?
			useMemo(() => withQueryBlockCompose(BlockEdit), [BlockEdit]) : BlockEdit;

		return (
			<InputComponentsContextProvider value={components}>
				<PropertyContextProvider value={pv}>
					<WrapBlockEdit {...props} />
				</PropertyContextProvider>
			</InputComponentsContextProvider>
		)

	}

	return <BlockEdit {...props} />

}, 'withCp')

addFilter(
	'editor.BlockEdit',
	'query-search/with-components-provider',
	withCp
);


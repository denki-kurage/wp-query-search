import { createHigherOrderComponent } from "@wordpress/compose";
import { RegistryProvider, createRegistry, withRegistry } from "@wordpress/data";
import { useEffect, useState } from "@wordpress/element";
import React from "react";

/*
export const withMultiStoreRegistryProvider = (stores: any[]) =>
{
	return createHigherOrderComponent(
		WrappedComponent => withRegistry(
			({registry, ...props}) =>
			{
				const [subRegistry, setSubRegistry] = useState();
	
				useEffect(() => {
					const newRegistry = createRegistry({}, registry) as any;
					stores.forEach(store => newRegistry.register(store));
					setSubRegistry(newRegistry);
				}, [registry])
	
				// これが無いとエラー
				if(!subRegistry)
				{
					return null;
				}
				
				return (
					<RegistryProvider value={subRegistry as any}>
						<WrappedComponent registry={subRegistry} {...props} />
					</RegistryProvider>
				)
			}
		),
		'withMultiStoreRegistryProvider'
	);
}



const withQuerySearch = withMultiStoreRegistryProvider([QuerySearchStore]);

export default withQuerySearch((props) =>
{
	// props.registry;

	const blockProps = useBlockProps();
	const innerBlockProps = useInnerBlocksProps();

	const contextKey = useSelect(s => s(QuerySearchStore).getContextKey(), []);
	const { setContextKey } = useDispatch(QuerySearchStore);

	if(!contextKey)
	{
		setContextKey(++counter);
		return <></>
	}

	return (
		<div data-context-key={contextKey} {...blockProps}>
			<h2>contextKey: {contextKey}</h2>
			<div {...innerBlockProps} />
		</div>
	)
	
});

*/

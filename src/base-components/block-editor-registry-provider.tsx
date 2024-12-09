import { store as blockEditorStore, storeConfig } from "@wordpress/block-editor";
import { compose, createHigherOrderComponent } from "@wordpress/compose"
import { createRegistry, RegistryProvider, useDispatch, useRegistry, useSelect } from "@wordpress/data"
import { useState, useEffect } from "@wordpress/element";
import React, {  } from "react";

const createSubRegistry = (registry, weakReferences) =>
{
    let subRegistry = weakReferences.get(registry);

    if(!subRegistry)
    {
        subRegistry = createRegistry({}, registry);
        subRegistry.registerStore('core/block-editor', storeConfig);
        weakReferences.set(registry, subRegistry)
    }

    return subRegistry;
}


/**
 * 新しく作成されたサブレジストリでコンテキストが上書きされます。
 * サブレジストリはregistryプロパティから取得できます。
 */
export const withLocalBlockEditorRegistry = createHigherOrderComponent(Edit => props =>
{
    const [weakReferences] = useState(() => new WeakMap());
    const registry = useRegistry();
    const subRegistry = createSubRegistry(registry, weakReferences);

    return (
        <RegistryProvider value={subRegistry}>
            <Edit registry={subRegistry} {...props} />
        </RegistryProvider>
    )
}, 'withBlockEditorLocalRegistry')


/**
 * 現在のブロックを、プロパティのblocksで上書きします。
 * withLocalBlockEditorRegistry()によってコンテキストをサブレジストリで上書きした上で使用してください。
 */
export const SubRegistryBlocksComponent = props =>
{
    const { blocks, listener, children } = props;
	const { resetBlocks } = useDispatch('core/block-editor');

    useEffect(() => {
        if(blocks)
        {
            resetBlocks(blocks);
        }
    }, [blocks])

    return <>{children}</>

}

/**
 * 簡易的なサブレジストリのブロックコンテキストをホストします。
 */
export const BlcoksContextHost = withLocalBlockEditorRegistry(({ blocks, children }) =>
{
     return (
        <SubRegistryBlocksComponent blocks={blocks}>
            { children }
        </SubRegistryBlocksComponent>
    )
});






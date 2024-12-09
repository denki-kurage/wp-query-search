import { store as blockEditorStore } from "@wordpress/block-editor";
import { BlockInstance } from "@wordpress/blocks";
import { useDispatch, useSelect } from "@wordpress/data";
import { createContext, useContext, useMemo } from "@wordpress/element";
import { compose } from "@wordpress/compose";



type BlockType = BlockInstance<Record<string, any>>;
type BlocksType = BlockType[];
type ComposeType = typeof compose;

export interface IBlocksContext
{
    useBlock: (clientId: string) => BlockType|undefined;
    useBlockChildren: (clientId: string) => BlocksType;
    useAttributesSet: (clientId) => [any, any];
}
const Context = createContext<IBlocksContext>(undefined as any);
export const { Provider: QueryFormBlocksContextProvider } = Context;
export const useQueryFormBlocksContext = () => useContext(Context);

export interface IBlockComposeContext
{
    (clientId?: string): { selfCompose: any, childrenCompose?: any }
}
const ComposeContext = createContext<IBlockComposeContext>(undefined as any);
export const { Provider: QueryFormComposeProvider } = ComposeContext;
export const useQueryFormComposeContext = () => useContext(ComposeContext);


/**
 * ブロックがストアに追加してある場合はストアからブロック情報を取得します。
 */
export const queryFormInspectorBlocksContext: IBlocksContext =
{
    useBlockChildren: (clientId: string) =>
    {
        return useSelect(s => {
            // @ts-ignore
            return s('core/block-editor').getBlocks(clientId) ?? [];

        }, [clientId])
    },
    useBlock: (clientId: string) =>
    {
        // @ts-ignore
        return useSelect(s => s('core/block-editor').getBlock(clientId), [clientId]);
    },
    useAttributesSet: (clientId: string) =>
    {
        const { updateBlockAttributes } = useDispatch(blockEditorStore);
        
        const { attributes } = useSelect(s => {
            // @ts-ignore
            return s(blockEditorStore).getBlock(clientId);
        }, [clientId])

        const setAttributes = useMemo(() => newAttributes => {
            updateBlockAttributes(clientId, newAttributes)
        }, [clientId]);

        return [attributes, setAttributes]
    }
}



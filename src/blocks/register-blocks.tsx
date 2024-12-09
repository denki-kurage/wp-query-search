import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import defaultSave from './save';

const domain = 'query-search';

export const registerQueryFormBlock = (block: any, edit: any, save: any = defaultSave) =>
{
    const mergedMetadata = { ...metadata, ...block };

    // title, keys, description, categoryは捨てておく。
    // 上記のプロパティがサーバー側のJSONを上書きしてしまうと翻訳が上書きされてしまうのを避ける
    const { title, keys, description, ...props } = mergedMetadata;

    registerBlockType(
        block.name,
        {
            ...props,
            attributes:
            {
                ...metadata.attributes,
                ...block.attributes
            },
            edit,
            save
        }
    )
}


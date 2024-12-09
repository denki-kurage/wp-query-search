import { useMemo } from "@wordpress/element";
import { createBlockBySchema } from "../blocks/utils";
import { store } from "../store";
import { useSelect } from "@wordpress/data";

export const useSchemaToBlocks = (args, record, raws: string[] = []) =>
{
    const { generateUniqueId } = useSelect(s => s(store), []) as any;

    return useMemo(() => {
        try
        {
            // 1. スキーマからブロックを組み立てる
            const blocks = [...Object.entries(args)].map(([field, args]) => createBlockBySchema('', field, args, generateUniqueId)).filter(b => !!b);
            const flatRecordMap = flatItems(record ?? {});
            const flatBlocksMap = flatBlocks(blocks);

            // 2. 更新の場合(追加の場合は{})はそのデータでブロックを初期化する
            initBlockQueries(flatBlocksMap, flatRecordMap);

            // 3. rawAttributeに属するブロックを調整する(titleやcontentなど)
            adjustRawBlocks(blocks, flatBlocksMap, raws);

            // 4. 変更追跡用としてこの時点でのブロックのデータを記録しておく
            const trackingBlockData = getTrackingData(blocks)

            return { blocks, trackingBlockData, error: null };            
        }
        catch(ex)
        {
            return { blocks: [], trackingBlockData: {}, error: ex.message }
        }

    }, [args]) as { blocks: any[], trackingBlockData: object, error: string|null }
}

/**
 * ノードは含まない形でオブジェクトツリーのマップを作製します。
 */
const flatItems = (item, stack: string[] = [], map = new Map<string, any>()) =>
{
    // TODO: めっちゃ紛らわしい。ここは後で改良する。
    if(typeof item === "object" && !Array.isArray(item) && !!item)
    {
        for(const [key, value] of [...Object.entries(item)])
        {
            stack.push(key);
            flatItems(value, stack, map);
            stack.pop();
        }
    }
    else
    {
        map.set(stack.join('.'), item)
    }

    return map;
}

/**
 * ブロックをフラットなマップにして取得します。
 * オブジェクトと違いこちらはノードも含みます。
 */
const flatBlocks = (blocks, stack: string[] = [], map = new Map<string, any>()) =>
{
    for(const block of blocks)
    {
        const field = block.attributes.field;
        if(field)
        {
            const path = [...stack, field].join('.');
            map.set(path, block);

            stack.push(field);
            flatBlocks(block.innerBlocks, stack, map);
            stack.pop();
        }
    }

    return map;
}

/**
 * ブロックの`query`属性に、対応するオブジェクトの値をマッピングします。
 * ただしオブジェクトに適切な値がない場合はそのブロックへのマッピングは無視されます。
 * 
 * block = x.y.z
 * obj = {x: { y: { z: 3 } } }
 * 
 * block.attributes.query = obj.x.y.z
 */
const initBlockQueries = (flatBlocksMap: Map<string, any>, flatRecordMap: Map<string, any>) =>
{
    for(const [path, block] of flatBlocksMap)
    {
        const field = block.attributes?.field;
        if(field !== undefined)
        {
            // リーフは値を変更。flatRecordMapはノードを持たないため
            if(flatRecordMap.has(path))
            {
                block.attributes.query = flatRecordMap.get(path);
            }
        }
    }
}

/**
 * rawをもつオブジェクトをそのrawで上書きします。
 * (title.raw, content.raw, excerpt.raw)等 → (title = title.raw, content = contant.raw, excerpt = excerpt.raw)
 */
const adjustRawBlocks = (blocks, flatBlocksMap, raws: string[]) =>
{
    for(const block of [...blocks])
    {
        const field = block.attributes?.field ?? '';
        if(raws.includes(field))
        {
            const rawBlock = flatBlocksMap.get(`${field}.raw`);

            if(rawBlock)
            {
                rawBlock.attributes.field = field;
                const idx = blocks.indexOf(block);
                if(idx !== -1)
                {
                    blocks.splice(idx, 1, rawBlock)
                }
            }

            continue;
        }

        adjustRawBlocks(block.innerBlocks, flatBlocksMap, raws);
    }
}

/**
 * ブロックツリーとオブジェクトの差異を検出し、更新するべきプロパティのリストを取得します。
 */
export const getChangedBlockQuery = (blocks, record) =>
{
    const flatBlocksMap = flatBlocks(blocks);
    const flatRecordMap = flatItems(record);
    const map = new Map<string, any>();

    for(const field of flatBlocksMap.keys())
    {
        const block = flatBlocksMap.get(field);
        const query = block.attributes?.query;

        if(query !== undefined)
        {
            if(flatRecordMap.has(field))
            {
                const recordValue = flatRecordMap.get(field);

                if(query !== recordValue)
                {
                    map.set(field, query);
                }
            }
            else
            {    
                //map.set(field, query);
            }
        }
    }

    //console.log([...flatBlocksMap.entries()].map(m => [m[0], m[1].attributes?.query].join(' : ')));
    //console.log([...flatRecordMap.entries()].map(m => m.join(' : ')));

    return map;
}


/**
 * flatなオブジェクトをオブジェクト(ツリー)に再変換します。
 * 
 * 変更マップ
 * changedMap["x.y.z"] = newValue
 * 
 * オブジェクトへの適用
 * obj.x.y.z = newValue
 */
export const flatToObject = (changedMap: Map<string, any>, obj = {}) =>
{

    for(const [key, value] of changedMap)
    {
        const names = key.split(".");
        const lastName = names.pop() ?? '';
        const curObj = names.reduce((pre, cur) => pre[cur] = pre?.[cur] ?? {}, obj);

        if(curObj && typeof curObj === "object")
        {
            curObj[lastName] = value;
        }
    }

    return obj;
}

/**
 * ブロックツリーのブロックからオブジェクトを抽出
 */
export const getTrackingData = (blocks) =>
{
    const flatBlocksMap = flatBlocks(blocks);

    const queries: any = [...flatBlocksMap.entries()]
                        .map(([k, v]) => [k, v.attributes?.query])
                        .filter(([, v]) => v !== undefined);

    const flatQueries = new Map<string, any>(queries);

    return flatToObject(flatQueries);
}





import { StateType } from "./reducer";
import { createRegistrySelector } from "@wordpress/data";
import { generateNewId } from "./utils";
import { store } from ".";
import { store as blockEditorStore } from "@wordpress/block-editor";


/*
export const getContextKey = (state: StateType) => state.contextKey;

export const getQUeries = (state: StateType) => state.queries;
export const getQueryItem = (state: StateType, clientId: string) => [...state.queries.values()].find(q => q.clientId === clientId);

export const getQueryItemsByContext = (state: StateType, contextClientId: string) =>
{
	return [...state.queries.values()].filter(item => item.contextClientId === contextClientId);
}
export const getClientIdByContext = (state: StateType, contextClientId: string) =>
{
	return getQueryItemsByContext(state, contextClientId).map(item => item.clientId);
}
export const getQueryContexts = (state: StateType) =>
{
	return [...new Set(getQueryItems(state).map(_ => _.contextClientId).values())]
}
export const getQueryItems = (state: StateType) => [...state.queries.values()]

*/

export const getResultViewName = (state: StateType) =>
{
	return state.blockDefines.resultViewName;
}

export const getQueryFormNames = (state: StateType) =>
{
	return state.blockDefines.queryFormNames;
}

export const getExtensionMode = (state: StateType) =>
{
	return state.blockDefines.enabledExtension;
}

export const getQuerySearchBlockNames = (state: StateType) =>
{
	return [state.blockDefines.resultViewName, ...state.blockDefines.queryFormNames];
}


export const findBlocks = createRegistrySelector(select =>
	(state: StateType, predicate?: (block) => boolean) =>
{
	const s = select(blockEditorStore);
	const blocks = s.getClientIdsWithDescendants().map(id => s.getBlock(id));
	return predicate ? blocks.filter(predicate) : blocks;
})

export const findBlocksByNames = createRegistrySelector(select => (state: StateType, names: string[]) =>
{
	const blocks = select(store).findBlocks();
	return blocks.filter(b => names.includes(b.name));
});



export const generateUniqueId = createRegistrySelector(select => (state: StateType) =>
{
	const { findBlocksByNames, getQuerySearchBlockNames } = select(store);
	const forms = getQuerySearchBlockNames();
	const blocks = findBlocksByNames(forms);
	const ids = blocks.map(b => b.attributes.uid);

	while(true)
	{
		const uid = generateNewId();
		if(!ids.includes(uid))
		{
			return uid;
		}
	}
});


// clientIdから一番近い親の結果ビューを取得します。
export const getParentResultView = createRegistrySelector(select => (state: StateType, clientId: string) =>
{
	const { getBlockParentsByBlockName, getBlock } = select(blockEditorStore);
	const rv = select(store).getResultViewName();
	const id = getBlockParentsByBlockName(clientId, rv)?.[0] ?? null;
	return id ? getBlock(id) : null;
});

// 全ての結果ビューを取得します(ただし(uid, kind, name)がまだ設定されていない場合は除外されます)。
export const getEnabledResultViews = createRegistrySelector(select => (state: StateType) =>
{
	const { findBlocks } = select(store);
	const rv = select(store).getResultViewName();

	// 
	return findBlocks().filter(b => b.name === rv).filter(block => !!block.attributes?.uid && !!block.attributes?.kind && !!block.attributes?.kind);
});


// 指定したresultViewIdの結果ビューを取得します。
export const getResultView = createRegistrySelector(select => (state: StateType, resultViewId: string) =>
{
	return resultViewId ? select(store).getEnabledResultViews().find(rv => rv.attributes.uid === resultViewId) : undefined;
});

// 
export const getQueryFormsByResultView = createRegistrySelector(select => (state: StateType, resultViewId: string) =>
{
	const forms = select(store).getQueryFormNames();
	return select(store).findBlocks().filter(b => forms.includes(b.name) && b.attributes.pid === resultViewId);
});


export const getQueryFormByUid = createRegistrySelector(select => (state: StateType, uid) => {
	const forms = select(store).getQueryFormNames();
	return select(store).findBlocks().find(b => b.attributes.uid === uid);
});


/**
 * 親のブロックを取得します。
 */
export const getParentBlock = createRegistrySelector(select => (state: StateType, clientId: string) =>
{
	const { getBlock, getBlockParents } = select(blockEditorStore);
	const parentId = getBlockParents(clientId, true)?.[0];
	return parentId && getBlock(parentId);
});

export const getAllEndpointArgs = createRegistrySelector(select => (state: StateType, kind: string, name: string, method: string = 'GET') => {
	
	const option = state.schemas.options?.[[kind, name].join(':')];
	const argsItems = option?.endpoints
		?.filter(ep => ep.methods.includes(method))
		.map(ep => ep.args);
	return argsItems?.[0];
	// return argsItems?.reduce((pre, cur) => ({...pre, ...cur}), {}) ?? {};
})




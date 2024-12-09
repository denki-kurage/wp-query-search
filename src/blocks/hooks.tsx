import { store as blocksStore } from "@wordpress/blocks";
import { getBlockType } from "@wordpress/blocks";
import { useSelect } from "@wordpress/data";
import { store } from "../store";

export const getQueryFormTitle = (name) =>
{
	return getBlockType(name)?.title ?? '???';
}

export const useQueryFormBlocks = () =>
{
	return useSelect(s => {
		const { getBlockType } = s(blocksStore) as any;
		const blockNames = s(store).getQueryFormNames();
		const xblocks = blockNames.map(name => [name, getBlockType(name)]);
		const blocks = xblocks.filter(([, block]) => !!block).map(([, block]) => block);
		const missingBlockNames = xblocks.filter(([, block]) => !block).map(([name]) => name);
		return { blockNames, blocks, missingBlockNames }
	}, []);
}

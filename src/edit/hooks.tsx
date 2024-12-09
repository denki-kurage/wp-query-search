import { select, useRegistry, useSelect } from "@wordpress/data";
import { store } from "../store";
import { addQueryArgs } from "@wordpress/url";
import { useMemo } from "@wordpress/element";

export const blocksToGroupByField = (blocks) =>
{
	const m = [];

	for(const block of blocks)
	{
		const field = block.attributes.field;
		if(field)
		{
			const arr = m[field] ?? [];
			// @ts-ignore
			m[field] = [...arr, block];
		}
	}

	return m;
}


const hasChildrenParents = ['query-search/multi-query-form', 'query-search/object-query-form'];
export const useQueries = (kind, name, uid) =>
{
	// @ts-ignore
	const baseURL = useEntityConfig(kind, name)?.config?.baseURL;

	// useQuery()の使用元を再レンダリングっせるため必要。
	const blocks = useSelect(s => {
		const { getQueryFormsByResultView, getParentBlock } = s(store);
		const blocks = getQueryFormsByResultView(uid);
		//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
		return blocks;
	}, [kind, name, uid]);

	
	//console.log("======================================")

	const registry = useRegistry(); 
	
	// @ts-ignore
	const { getParentBlock } = registry.select(store);
	const toplevelBlocks = blocks.filter(block => !hasChildrenParents.includes(getParentBlock(block.clientId)?.name));

	// @ts-ignore
	const enabledBlocks = toplevelBlocks.filter(b => b.attributes?.enabled);
	const queries = enabledBlocks.reduce((pre, cur) => ({...pre, [cur?.attributes?.field]: createQueryFormNestedObject(cur)}), {});
	const queryString = addQueryArgs(baseURL ?? '', queries);

	return { queries, queryString, blocks, toplevelBlocks, enabledBlocks, baseURL }
}

export const useEntityConfig = (kind, name) =>
{
	const { getEntitiesConfig } = select('core') as any;

	return useMemo(() => {
		
		/**
		 * コアのバグのため、重複を排除する。
		 */
		const configs = [...(new Map<string, any>(getEntitiesConfig(kind)?.map(c => [c.name, c])) ?? []).values()];
		const config = configs?.find(c => c.kind === kind && c.name === name);
		return { configs, config, hasConfig: !!config }
	}, [kind, name]);
}



/**
 * ブロックのクエリを取得します。
 * ネスト構造のブロックは階層を含め取得します。
 */
export const createQueryFormNestedObject = (block) =>
{
	const multi = 'query-search/multi-query-form';
	const obj = 'query-search/object-query-form';

	const getBlockQuery = block =>
	{
		if(!block)
		{
			return;
		}

		if(block.name === multi)
		{
			const selectedUid = block.attributes.selectedUid;
			const selectedBlock = block.innerBlocks.find(b => b.attributes?.uid === selectedUid);
			return getBlockQuery(selectedBlock)
		}

		if(block.name === obj)
		{
			return block.innerBlocks.reduce((pre, cur) => ({ ...pre, [cur.attributes.field]: getBlockQuery(cur) }), {});
		}

		return block.attributes?.query;
	}

	return getBlockQuery(block);
}


const toValueString = (value: any) =>
{
	const vt = typeof value;
	const primitives = 'string,number,boolean'.split(',')

	if(Array.isArray(value))
	{
		return value.map(v => primitives.includes(typeof v) ? v.toString() : vt).join(', ')
	}

	if(!!value && vt === 'object')
	{
		return JSON.stringify(value, null, '  ');
	}

	if(primitives.includes(vt))
	{
		return value.toString();
	}

	return vt;	
}

// アイテムのネスト構造を一元化する
const flatColumns = (item, columns = {}, deps: string[] = []) => {
	for (const [key, value] of Object.entries(item))
	{
		const isArray = Array.isArray(value)
		if (!!value && typeof value === "object" && !isArray)
		{
			deps.push(key);
			flatColumns(value, columns, deps);
			deps.pop();
		}
		else
		{
			const newKey = [...deps, key].join(".");

			/**
			 * TODO: DataGrid側でやるべき
			 */
			columns[newKey] = toValueString(value);
		}
	}
	return columns;
};

/**
 * TODO: テスト必要
 */
const getAllFlatColumnNames = (items) =>
{
	const columns = new Set<string>([]);
	const flatItems: object[] = [];
	for (const item of items)
	{
		const line = flatColumns(item);
		flatItems.push(line);
		Object.keys(line).forEach((l) => columns.add(l));
	}

	return [flatItems, [...columns.keys()]] as [object[], string[]];
}

/**
 * 
 * @param items テーブルに出力する配列
 * 
 * itemsの全オブジェクトをフラットに変換したflatItemsと
 * 全プロパティを抽出したflatColumnsを返します。
 * 
 * items[0] = { a: 1, b: { x: 2 }, c: 3}
 * items[1] = { a: 6, b: 7, c: { y: 8 } }
 * 
 * flatItems
 * a: 1, b.x: 2, c: 3
 * a: 6, b: 7, c.y: 8
 * 
 * flatColumns = a, b.x, c, c.y
 */
export const useColumns = (items) => {
	return useMemo(() => {
		const [flatItems, flatColumns] = getAllFlatColumnNames(items ?? []);
		return { flatItems, flatColumns }
	}, [items]);
};


export const useAllEndpointArgs = (kind, name, method: string = 'GET') =>
{
	const args = useSelect(s => {
		return s(store).getAllEndpointArgs(kind, name, method);
	}, [kind, name, method]) ?? {};

	return useMemo(() => {
		const fields = [...Object.keys(args)];
		// @ts-ignore
		const options = Object.entries(args).map(([k, v]) => ({ label: `${k} : ${v?.description}`, value: k }));
		return { args, fields, options }
	}, [kind, name, method, args])
}

export const useEntityConfigOptions = (kind, name) =>
{
	const { configs, config, hasConfig } = useEntityConfig(kind, name);

	return useMemo(() => {
		const kindOptions = ['postType', 'taxonomy', 'root'].map(x => ({label: x, value: x}))
		const postTypeOptions = configs?.filter(c => !!c.baseURL).map(c => ({label: `${c.label}(${c.name})`, value: c.name})) ?? [];
		return { kindOptions, postTypeOptions, configs, config, hasConfig }
	}, [kind, name]);
}























const createRoute = (kind: string, name: string, path: string, options: object, type: 'edit' | 'frontend' | 'control') =>
{
	return { kind, name, path, options, type }
}

const routes = [

	// post
	createRoute('postType', 'post', '/wp-admin/post.php', { post: '{id}', action: 'edit' }, 'edit'),
	createRoute('postType', 'post', '/wp-admin/edit.php', {}, 'control'),
	createRoute('postType', 'post', '{link}', {}, 'frontend'),

	// page
	createRoute('postType', 'page', '/wp-admin/post.php', { post: '{id}', action: 'edit' }, 'edit'),
	createRoute('postType', 'page', '/wp-admin/edit.php', { post_type: 'page' }, 'control'),
	createRoute('postType', 'page', '{link}', {}, 'frontend'),

	// media
	createRoute('postType', 'attachment', '/wp-admin/upload.php', { item: '{id}', action: 'edit' }, 'edit'),
	createRoute('postType', 'attachment', '/wp-admin/post.php', { post: '{id}', action: 'edit' }, 'edit'),
	createRoute('postType', 'attachment', '/wp-admin/upload.php', {}, 'control'),
	createRoute('postType', 'attachment', '{link}', {}, 'frontend'),

	// nav_menu_item
	createRoute('postType', 'nav_menu_item', '/wp-admin/nav-menus.php', { menu: '{menus}', action: 'edit' }, 'edit'),
	createRoute('postType', 'nav_menu_item', '/wp-admin/nav-menus.php', {}, 'control'),
	createRoute('postType', 'nav_menu_item', '{url}', {}, 'frontend'),

	
	// wp_block
	createRoute('postType', 'wp_block', '/wp-admin/site-editor.php', { post_type: 'wp_block', postId: '{id}', canvas: 'edit' }, 'edit'),
	createRoute('postType', 'wp_block', '/wp-admin/site-editor.php', { post_type: 'wp_block' }, 'control'),

	// wp_template
	createRoute('postType', 'wp_template', '/wp-admin/site-editor.php', { postType: 'wp_template', canvas: 'edit' }, 'edit'),
	createRoute('postType', 'wp_template', '/wp-admin/site-editor.php', { postType: 'wp_template' }, 'control'),

	// wp_template_parts
	createRoute('postType', 'wp_template', '/wp-admin/site-editor.php', { postType: 'wp_template', canvas: 'edit' }, 'edit'),
	createRoute('postType', 'wp_template', '/wp-admin/site-editor.php', { postType: 'wp_template' }, 'control'),


	// global-styles


	// navigation
	createRoute('postType', 'wp_navigation', '/wp-admin/site-editor.php', {  post_type: 'wp_navigation', menu: '{menus}', action: 'edit' }, 'edit'),
	createRoute('postType', 'wp_navigation', '/wp-admin/site-editor.php', { post_type: 'wp_navigation' }, 'control'),


	// wp_font_family

	// wp_font_face


	// category
	createRoute('taxonomy', 'category', '/wp-admin/term.php', { taxonomy: 'category', tag_ID: '{id}', post_type: 'post' }, 'edit'),
	createRoute('taxonomy', 'category', '/wp-admin/edit-tags.php', { taxonomy: 'category' }, 'control'),
	createRoute('taxonomy', 'category', '{link}', {}, 'frontend'),

	// post_tag
	createRoute('taxonomy', 'post_tag', '/wp-admin/term.php', { taxonomy: 'post_tag', tag_ID: '{id}', post_type: 'post' }, 'edit'),
	createRoute('taxonomy', 'post_tag', '/wp-admin/edit-tags.php', { taxonomy: 'post_tag' }, 'control'),
	createRoute('taxonomy', 'post_tag', '{link}', {}, 'frontend'),


	// nav_menu
	createRoute('taxonomy', 'nav_menu', '/wp-admin/nav-menus.php', { menu: '{id}', action: 'edit' }, 'edit'),
	createRoute('taxonomy', 'nav_menu', '/wp-admin/nav-menus.php', {}, 'control'),


	// wp_pattern_category
	//createRoute('taxonomy', 'wp_pattern_category', '', {}, 'edit'),
	//createRoute('taxonomy', 'wp_pattern_category', '', {}, 'control'),


	// media

	
	// sidebar

	// widget
	createRoute('root', 'widget', '/wp-admin/widgets.php', {}, 'control'),

	// user
	createRoute('root', 'user', '/wp-admin/user-edit.php', { user_id: '{id}' }, 'edit'),
	createRoute('root', 'user', '/wp-admin/users.php', {}, 'control'),
	createRoute('root', 'user', '/author/{slug}/', {}, 'frontend'),


	// comment
	createRoute('root', 'comment', '/wp-admin/comment.php', { c: '{id}', action: 'editcomment' }, 'edit'),
	createRoute('root', 'comment', '/wp-admin/edit-comments.php', {}, 'control'),
	createRoute('root', 'comment', '{link}', {}, 'frontend'),


	// menu
	createRoute('root', 'menu', '/wp-admin/nav-menus.php', { menu: '{menus}', action: 'edit' }, 'edit'),
	createRoute('root', 'menu', '/wp-admin/nav-menus.php', {}, 'control'),
	createRoute('root', 'menu', '{url}', {}, 'frontend'),

	// menuItem
	createRoute('root', 'menuItem', '/wp-admin/nav-menus.php', {}, 'control'),
	createRoute('root', 'menuItem', '{url}', {}, 'frontend'),

	// theme
	createRoute('root', 'theme', '/wp-admin/themes.php', { theme: '{stylesheet}' }, 'edit'),
	createRoute('root', 'theme', '/wp-admin/themes.php', {}, 'control'),

	// plugin
	createRoute('root', 'plugin', '/wp-admin/plugins.php', { plugin_status: '{plugin}' }, 'edit'),
	createRoute('root', 'plugin', '/wp-admin/plugins.php', {}, 'control'),

	// site
	createRoute('root', 'site', '/wp-admin/options-general.php', {}, 'control'),

]
export type EntityRouteType = typeof routes[0]
export const defaultEntityRoutes = routes;

// TODO: このエンティティルートはサーバーから取得できるようにする。
export const findEntityRoute = (kind: string, name: string, type: string) =>
{
	return defaultEntityRoutes.find(r => r.kind === kind && r.name === name && r.type === type);
}

const sani = (value: any) =>
{
	const type = typeof value;
	return ['string', 'number'].includes(type) ? '' + value : '';
}
export const createEntityRouteLink = (kind: string, name: string, type: string, site: string, entity?: {[key: string]: string}) =>
{
	const repl = (str: string) =>
	{
		return str.replace(/{([a-z\_]+)}/g, (m, property) => sani(entity?.[property]))
	}

	const route = findEntityRoute(kind, name, type);

	if(route)
	{
		const match = route.path.match(/^{([a-z\_]+)}$/);
		if(match)
		{
			const entityValue = sani(entity?.[match[1]]);
			return typeof entityValue === 'string' ? entityValue : null;
		}

		const path = repl(route.path);
		const parameters = [...Object.entries(route.options)]
				.reduce((pre, cur) => ({...pre, [cur[0]]: repl(cur[1])}), {});
		return addQueryArgs(site + path, parameters)
	}
}

/*
await Promise.all(
    ['postType', 'taxonomy', 'root'].map(kind =>
        wp.data.select('core').getEntitiesConfig(kind).slice(0, 18).map(async config => {
            const items = await ((async () => { try{ return await wp.apiFetch({path: config.baseURL}); }catch{ return null } })())
            const dataType = Array.isArray(items) ? "Array" : "Object";
            const pagenate = config?.supportsPagination;
            const primaryKey = config?.key;
            const arrayItems = (dataType === "Array" ? items : [...Object.entries(items || {}).map(([k, v]) => v)]) ?? [];
            return ({ kind, name: config.name, dataType, pagenate, primaryKey, arrayItems })
        })
    ).flat()
)
*/


export const itemsToArray = (items) =>
{
	if(Array.isArray(items))
	{
		return ['Array', items]
	}

	if(typeof items === 'object' && items !== undefined && items !== null)
	{
		const properties = [...Object.values(items)];
		const isAllObject = properties.every(v => typeof v === 'object' && v !== undefined);
		return isAllObject ? ['Object', properties] : ['SingleObject', [items]];
	}

	return ['Empty', []];
}

export const getEntityRenderInfo = (config) =>
{
	const enablePagination = !!config?.supportsPagination;
	const primaryKey = config?.key || 'id';
	return { enablePagination, primaryKey }
}


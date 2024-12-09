import React, { useState } from "react"
import Box from '@mui/material/Box';

import { Spinner, Modal } from "@wordpress/components";
import { memo, Suspense, useEffect, useMemo } from "@wordpress/element";
import { createHigherOrderComponent } from "@wordpress/compose";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { GridActionsCellItem, type GridRowParams } from "@mui/x-data-grid";

import Home from "@mui/icons-material/Home";
import Web from "@mui/icons-material/Web";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import { createEntityRouteLink } from "./hooks";
import { useSelect } from "@wordpress/data";
import { Link } from "@mui/material";
import { DeleteEntityForm, EditEntityForm } from "./edit-entity-buttons";
import { useOpenCloseContext, withOpenCloseDefaultProvider } from "../base-components/async-dialog-components/open-close-context";
import { store } from "../store";
import { useResultViewInfoContext } from "./context";
import { __ } from "@wordpress/i18n";



/**
 * WordPressのバージョンによりエディタにiframeが追加されるようになった。
 * 結果、MUI X DataGridに適用されるCSSが抜けデザインが崩れてしまう。
 * さらには「コードエディタ→ビジュアルエディタ」の時にCSSがクリアされる。
 * また特定のプラグインを有効かするとiframeが抜けてしまう。
 * 動的に先祖にiframeがあるかをを確認しスタイルを適用する必要があるため、
 * BODYエレメントを弱参照キーにキャッシュを保持する。
 */
const initEmotionCache = () =>
{
	const caches = new WeakMap();

	const getHead = () =>
	{
		const iframe = window?.document?.getElementsByTagName('iframe')?.[0];
		return iframe?.contentWindow?.document?.head || document.head;
	}

	const getCache = () =>
	{
		const head = getHead();

		if(head && !caches.has(head))
		{
			caches.set(
				head,
				createCache({
					key: 'css',
					container: head,
					prepend: false
				})
			);
		}

		return head && caches.get(head);
	}

	return {
		get: getCache
	}
}
const defaultEmotionCache = initEmotionCache();



const createComponentLoader = <T,>(callback) =>
{
	let components: any = null;
	const promise = (async () => { components = await callback() })();


	return {
		get: (): T => 
		{
			if(components)
			{
				return components;
			}
			throw promise;
		}
	}
}

type DataGridPackage = typeof import("@mui/x-data-grid");
const dataGridLoader = createComponentLoader<DataGridPackage>(() => import("@mui/x-data-grid"));



const withSuspense = createHigherOrderComponent(Edit => props =>
{
	const cache = defaultEmotionCache.get();

	if(cache)
	{
		return (
			<CacheProvider value={cache}>
				<Suspense fallback={ <Spinner /> }>
					<Edit {...props} />
				</Suspense>
			</CacheProvider>
		)
	}

	return <Edit {...props} />

}, 'withSuspense');


interface IModalState
{
	isOpened: boolean;
	kind: string;
	name: string;
	id: string;
}

const pageSizeOptions = [10, 20, 30, 50, 100];

export default memo(withSuspense(withOpenCloseDefaultProvider(({ kind, name, items, columns, totalItems, onPageChanged, enablePagination, isLoading, idName }) =>
{
	const { DataGrid, GridToolbar } = dataGridLoader.get();
	const enabledExtension = useSelect(s => s(store).getExtensionMode(), []);

	const [ paginationModel, setPaginationModel ] = useState({
		pageSize: 10,
		page: 0
	});
	const { page, pageSize } = paginationModel;

	const { open, isOpened } = useOpenCloseContext();
	const [ editModalInfo, setEditModalInfo ] = useState<{id: number|string, mode: 'edit'|'delete'}>(undefined as any);
	const openEditor = (id: number|string, mode: 'edit'|'delete') =>
	{
		setEditModalInfo({id, mode});
		open();
	}

	const { listviewHeight } = useResultViewInfoContext();
	
	// @ts-ignore
	const site = useSelect(s => s('core')?.getSite()?.url, []);
	const controlUrl = site ? createEntityRouteLink(kind, name, 'control', site) : undefined;


	useEffect(() => {
		onPageChanged({page: page + 1, pageSize});
	}, [page, pageSize])

	const { columns2 } = useMemo(() => {
		const columns2 = columns.map(n => ({ field: n, headerName: n}));

		const createLinkProps = (entity, type) =>
		{
			const href = createEntityRouteLink(kind, name, type, site, entity);
			return href ? ({ component: Link, href, target: '_blank' }) : undefined;
		}


		columns2.push({ field: 'move', type: 'actions', headerName: __('Move', 'query-search'), 
			getActions: (params: GridRowParams) => {
				const editLink = createLinkProps(params.row, 'edit')
				const frontLink = createLinkProps(params.row, 'frontend')
				return [
					<GridActionsCellItem icon={<Web />} {...editLink} disabled={!editLink} label={__('Go to edit page', 'query-search')} />,
					<GridActionsCellItem icon={<Home />} {...frontLink} disabled={!frontLink} label={__('Go to front', 'query-search')} />
				]
			}
		})

		/**
		 * 
		 * TODO: 現在は開発中のため、拡張を有効にしない場合はアクションを追加しない
		 * 
		 */
		if(!enabledExtension)
		{
			return { columns2 }
		}
		
		columns2.push({ field: 'actions', type: 'actions', headerName: __('Actions', 'query-search'), 
			getActions: (params: GridRowParams) => {

				const id = params.id.toString();
				
				return [
					<GridActionsCellItem icon={<Edit />} onClick={() => openEditor(id, 'edit')} label={__('Edit', 'query-search')} />,
					<GridActionsCellItem icon={<Delete />} onClick={() => openEditor(id, 'delete')} label={__('Delete', 'query-search')} />
				]
			}
		})


		return { columns2 }
	}, [columns, enabledExtension])

	const { checkedIds, changeIds } = useResultViewInfoContext();


	const rowSelectChanged = ids =>
	{
		changeIds(ids)
	}


	return (
		<Box sx={{ height: listviewHeight, width: '100%' }}>
			<style>
				{`
					input[type="checkbox"]
					{
						width: 100%;
						height: 100%;
					}
				`}
			</style>
			<DataGrid
				paginationMode="server"
				paginationModel={enablePagination ? paginationModel : undefined}
				onPaginationModelChange={setPaginationModel}

				pageSizeOptions={pageSizeOptions}
				columns={columns2}
				rows={items}
				rowCount={totalItems}
				loading={isLoading}

				checkboxSelection
				disableRowSelectionOnClick

				rowSelectionModel={checkedIds}
				onRowSelectionModelChange={rowSelectChanged}
				keepNonExistentRowsSelected
				

				slots={{
					toolbar: GridToolbar
				}}

				getRowId={idName !== 'id' ? row =>row[idName] : undefined}
				initialState={{
					
				}}
			/>
			
			<EditModal kind={kind} name={name} id={editModalInfo?.id} mode={editModalInfo?.mode} title={__('Edit/Delete', 'query-search')} />
			
		</Box>
	)
})));


const EditModal = ({ kind, name, id, mode, title }) =>
{
	const { isOpened, close } = useOpenCloseContext();

	return (
		<>
			{ isOpened &&
				<Modal onRequestClose={close} title={title}>
					<>
						{ mode === 'edit' && <EditEntityForm kind={kind} name={name} id={id} /> }
						{ mode === 'delete' && <DeleteEntityForm kind={kind} name={name} id={id} /> }
					</>
				</Modal>
			}
		</>
	)
}


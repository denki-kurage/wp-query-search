import React, { useEffect } from "react"
import { useLoadEntityState } from "../hooks/use-entity-state"
import { useQueries, useColumns, getEntityRenderInfo, useEntityConfig } from "./hooks"
import { useMemo, useState } from "@wordpress/element"

import { InspectorControls } from "@wordpress/block-editor"
import { PanelBody } from "@wordpress/components"
import { ColumnsView } from "./columns-view"
import { IdsView } from "./ids-view"
import ListViewComponent from './list-view-mui-data-grid-version'
import { useResultViewInfoContext } from "./context"
import { __ } from "@wordpress/i18n"
//import ListViewComponent from './list-view-default';




export const ListView = ({ kind, name, uid }) =>
{
	const [page, setPage] = useState({ page: 1, pageSize: 10});
	const { queries } =  useQueries(kind, name, uid) ?? {};
	const { config } = useEntityConfig(kind, name);
	const { selectedColumns } = useResultViewInfoContext();

	
	queries['per_page'] = queries.per_page || page.pageSize;
	queries['page'] = queries.page || page.page;

	if(queries.page === 0 || queries.per_page === 0)
	{
		throw new Error("page:" + JSON.stringify(queries))
	}

	const { items, isLoading, totalItems } = useLoadEntityState(name, kind, queries);
	const { primaryKey: idName, enablePagination } = getEntityRenderInfo(config);


	// @ts-ignore IDがない場合は除外する
	//items?.splice(0, items?.filter(item => typeof item?.[idName] === 'number'));

	const { flatColumns, flatItems } = useColumns(items ?? []);
	const filteredColumns = useMemo(() => flatColumns.filter(c => selectedColumns.includes(c)), [selectedColumns, flatColumns]);


	const onPageChanged = (page) =>
	{
		setPage(page)
	}

	// useEffect(() => { console.log('queries'); console.log(queries) }, [queries])

/*
	useEffect(() => { console.log('flatItems'); console.log(flatItems) }, [flatItems])
	useEffect(() => { console.log('filteredColumns');  console.log(filteredColumns)}, [filteredColumns])

	useEffect(() => { console.log('isLoading'); console.log(isLoading) }, [isLoading])
	useEffect(() => { console.log('totalItems'); console.log(totalItems) }, [totalItems])
	useEffect(() => {
		console.log("kind, name");
		console.log(`${kind}: ${name}`)
	}, [kind, name])
*/


	return (
		<>
			<ListViewComponent
				kind={kind}
				name={name}
				items={flatItems ?? []}
				columns={filteredColumns}
				isLoading={isLoading}
				totalItems={totalItems}
				enablePagination={enablePagination}
				onPageChanged={onPageChanged}
				idName={idName}
			/>
			<InspectorControls>

			
			<PanelBody title={__('Selected entity items', 'query-search')}>
				<IdsView kind={kind} name={name} idName={idName} />
			</PanelBody>
			
			<PanelBody title={__('Column view', 'query-search')}>
				<ColumnsView columns={flatColumns} />
			</PanelBody>

		</InspectorControls>
		</>
	)

	
}

import { Spinner, CheckboxControl } from "@wordpress/components";
import { useState } from "@wordpress/element";
import React from "react";
import QueryPagination from "./query-pagination";
import { ListViewCommands } from "./list-view-commands";
import { __ } from "@wordpress/i18n";



export default ({ kind, name, items, columns, checkedIds: ids, onCheckedIdsChanged, totalItems, totalPages, isLoading }) =>
{

	const warning = (() => {
		if(isLoading)
		{
			return <Spinner />
		}

		if(!items)
		{
			return <p>エンティティを選んでください。</p>
		}

		if(items.length === 0)
		{
			return <p>アイテムがありませんでした。</p>
		}
	})();

	if(warning)
	{
		return <div className="query-search-list-view-warning">{warning}</div>
	}


	const columnsCount = columns.length;
	const checkedIds = new Set(ids);

	const [ page, setPage ] = useState(1);
	
	const toggleChange = (id, isCheck) =>
	{
		isCheck ? checkedIds.add(id) : checkedIds.delete(id);
		onCheckedIdsChanged([...checkedIds.values()]);
	}


	return (
		<div className="query-search-list-view-table">
		<table style={{width: '100%'}}>
			<thead>
				<tr>
					<td colSpan={columnsCount + 1}>
						<QueryPagination
							totalItems={totalItems}
							totalPages={totalPages}
							page={page}
							onPageChanged={setPage}
							/>
					</td>
				</tr>
				<tr>
					<td>選択</td>
					{
						columns.map(n => <td key={n}>{n}</td>)
					}
					<td key="commands">commands</td>
				</tr>
			</thead>
			<tbody>
				{
					items.map(fi => {
						const id = fi?.id ?? 0;
						const fields = columns.map(n => <td key={n}>{fi?.[n] ?? 'x'}</td>);
						const checked = checkedIds.has(id);

						if(!id)
						{
							return null;
						}

						return (
							<tr key={id}>
								<td><CheckboxControl __nextHasNoMarginBottom={true} checked={checked} onChange={(isCheck) => toggleChange(id, isCheck)} /></td>
								{fields}
								<td><ListViewCommands kind={kind} name={name} id={id} /></td>
							</tr>
						)
					})
				}
			</tbody>
			<tfoot>
				<tr>
					<td colSpan={columnsCount + 1}>
						<QueryPagination
							totalItems={totalItems}
							totalPages={totalPages}
							page={page}
							onPageChanged={setPage}
							/>
					</td>
				</tr>
			</tfoot>
		</table>
		</div>
	)
}




	
	
	
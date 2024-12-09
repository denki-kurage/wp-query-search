import { Button } from "@wordpress/components";
import React from "react";
import { ModalOpenButton } from "../base-components/async-dialog-components/buttons-extensions";
import { useLoadEntityState } from "../hooks/use-entity-state";
import { useColumns } from "./hooks";
import { useResultViewInfoContext } from "./context";
import { __, sprintf } from "@wordpress/i18n";

const titles = ['title', 'title.raw', 'description'];

const toName = item =>
{
    return titles.map(t => item?.[t]).filter(msg => !!msg).join(', ') || `${item?.id}`;
}
export const IdsView = ({ kind, name, idName }) =>
{
    const { changeIds, checkedIds } = useResultViewInfoContext();
    //const options = useMemo(() => checkedIds.map(c => ({ label: c, value: c, disabled: true })), [checkedIds]);

	// 現在表示されているアイテムに無い範囲外のチェックアイテムを取得します。
	const { items } = useLoadEntityState(name, kind, { include: checkedIds, per_page: Math.max(1, checkedIds.length) });
	const { flatItems } = useColumns(items ?? []);


    const viewPairs = new Map(flatItems.map(item => [item?.[idName], toName(item)]));
    const viewIds = new Set([...viewPairs.keys()])
    
    const checkedViewPairs = new Map(flatItems.map(item => [item?.[idName], toName(item)]));
    const checkedViewIds = new Set([...checkedViewPairs.keys()]);

    const msg = __('There are %s items', 'query-search');
    const smsg = sprintf(msg, checkedIds.length.toString());
    
    const onRemovedId = id =>
    {
        const ids = new Set(checkedIds);
        ids.delete(id);
        changeIds([...ids.values()])
    }

    return (
        <div className="modal-key-value-editor-container">

            <div className="notice-info">{ smsg } </div>

            <ModalOpenButton label={__('Delete ID from list', 'query-search')}>
                <table style={{width: "100%"}}>
                    <thead>
                        <tr>
                            <th>チェック</th>
                            <th>ID</th>
                            <th>要綱</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            checkedIds.map((id, idx) =>
                                (<IdChecker
                                    key={idx}
                                    id={id}
                                    isView={viewIds.has(id)}
                                    isCheckedView={checkedViewIds.has(id)}
                                    description={viewPairs.get(id) ?? checkedViewPairs.get(id) ?? ''}
                                    onCheckRemove={() => onRemovedId(id)}
                                    />)
                            )
                        }
                    </tbody>
                </table>
            </ModalOpenButton>
        </div>
    )
}

const IdChecker = ({ id, isView, isCheckedView, description, onCheckRemove }) =>
{
    // 現在リストに含まれるチェック、含まれていないものを追加で取得してきたチェックの色分け。
    const viewClass: any = isView ? { backgroundColor: "#f0f0ff" } :
                            isCheckedView ? { backgroundColor: "#f0fff0" } :
                            {};

    return (
        <tr style={viewClass}>
            <td><Button variant="primary" onClick={onCheckRemove}>{__('Remove', 'query-search')}</Button></td>
            <td>{id}</td>
            <td>{description ?? ''}</td>
        </tr>
    )
}


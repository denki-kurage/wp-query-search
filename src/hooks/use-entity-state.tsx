import { store as coreDataStore } from "@wordpress/core-data";
import { useDispatch, useSelect } from "@wordpress/data";
import { useCallback } from "@wordpress/element";

export type SaveEntityAsyncType = ReturnType<typeof useSaveEntityAsync>;
export const useSaveEntityAsync = (kind: string, name: string, value: any) =>
{
	const params = [kind, name] as any as [string, string, any];
	const { saveEntityRecord } = useDispatch(coreDataStore);
	
	const { lastError, isExecuting } = useSelect(select => {
		const s = select(coreDataStore);
		const lastError = s.getLastEntitySaveError(...params);
		const isExecuting = s.isSavingEntityRecord(...params);
		return { lastError, isExecuting }
	}, [kind, name]);

	const save = useCallback(async () => {
		return await saveEntityRecord(...params, value);
	}, [kind, name, value])

	return ({
		save,
		lastError,
		isExecuting
	})
}

export type EditEntityAsyncType = ReturnType<typeof useEditEntityAsync>;
export const useEditEntityAsync = (kind: string, name: string, id: string|number) =>
{
	const params = [kind, name, id] as [string, string, number | string];
	
	const { editEntityRecord, saveEditedEntityRecord  } = useDispatch(coreDataStore);

	return useSelect(select => {

		const s = select(coreDataStore) as any;

		return ({
			record: s.getEntityRecord(...params),
			editedValue: s.getEditedEntityRecord(...params),
			lastError: s.getLastEntitySaveError(...params),
			isExecuting: s.isSavingEntityRecord(...params),
			hasEdits: s.hasEditsForEntityRecord(...params),
			save: async () =>
			{
				return await saveEditedEntityRecord(...params, undefined);
			},
			edit: (edits: any) => editEntityRecord(...params, edits)
		})

	}, [kind, name, id]);
}


export type DeleteEntityAsyncType = ReturnType<typeof useDeleteEntityAsync>;
export const useDeleteEntityAsync = (kind: string, name: string, id: string|number) =>
{
	const params = [kind, name, id] as [string, string, number|string];

	const { deleteEntityRecord } = useDispatch(coreDataStore);
	return useSelect(select => {

		const s = select(coreDataStore) as any;

		return ({
			lastError: s.getLastEntityDeleteError(...params),
			isExecuting: s.isDeletingEntityRecord(...params),
			post: s.getEntityRecord(...params),
			del: async () =>
			{
				// @ts-ignore
				return await deleteEntityRecord(...params);
			}
		})

	}, [kind, name, id]);
}


export const useLoadEntityState = (name: string, kind: string, query: any = {}) =>
{
	const params = [kind, name, query] as [string, string, any];

	return useSelect(select => {
		const s = select(coreDataStore);

		return ({
			items: s.getEntityRecords(...params),
			totalItems: s.getEntityRecordsTotalItems(...params),

			// @ts-ignore
			isLoading: !s.hasFinishedResolution('getEntityRecords', params)
		})
	}, [kind, name, query]);


}



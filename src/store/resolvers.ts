import apiFetch from "@wordpress/api-fetch"

import { store as coreStore } from "@wordpress/core-data";

export const getAllEndpointArgs = (kind: string, name: string) => async (p) =>
{
	const { dispatch, registry, select, resolveSelect } = p;

	// getEntityConfig()は遅延読み込みなので、先にレコード経由でコンフィグを読み込んでキャッシュしておく。
	const configs = await registry.resolveSelect(coreStore).getEntitiesConfig(kind);
	const config = configs?.find(config => config?.kind === kind && config?.name === name);

	if(config)
	{
		const entity = registry.select(coreStore).getEntityConfig(kind, name);
		const path = entity?.baseURL;
		const option = await apiFetch({ path, method: 'OPTIONS' });

		dispatch.setEndpointOption(kind, name, option)
	}
}


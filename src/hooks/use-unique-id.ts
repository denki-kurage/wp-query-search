import { useSelect } from "@wordpress/data";
import { store } from "../store";

export const useUniqueId = () =>
{
	const { generateUniqueId } = useSelect(s => s(store), []);
	const getUid = () => generateUniqueId();
	return getUid;
}


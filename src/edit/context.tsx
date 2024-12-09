import { createContext, useContext } from "@wordpress/element";

export interface ResultViewContextInfo
{
    checkedIds: number[];
    listviewHeight: number;
    selectedColumns: string[];
    queryFormSelection: { selectedQueryForm: string, selectedEndpoint: string };

    changeIds: (ids: number[]) => void;
    setListViewHeight: (height?: number) => void;
    changeColumns: (columns: string[]) => void;
    setQueryFormSelection: (selection: { selectedQueryForm: string, selectedEndpoint: string }) => void;
}

const context = createContext({

} as ResultViewContextInfo);
export const { Provider: ResultViewInfoContextProvider } = context;
export const useResultViewInfoContext = () => useContext(context);

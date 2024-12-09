import { createHigherOrderComponent } from "@wordpress/compose";
import React, { createContext, useContext, useState } from "react";

export interface OpenCloseContextProps
{
	isOpened: boolean;
	open: () => void;
	close: () => void;
	closed?: () => void;
}
const OpenCloseContext = createContext<OpenCloseContextProps>({
	isOpened: false,
	open: () => {},
	close: () => {}
});

export const OpenCloseContextProvider = OpenCloseContext.Provider;
export const OpenCloseContextConsumer = OpenCloseContext.Consumer;
export const useOpenCloseContext = () => useContext(OpenCloseContext);



export const OpenCloseDefaultProvider = ({children}) =>
{
	const [isOpened, setIsOpened] = useState(false);
	const open = () => setIsOpened(true);
	const close = () => { setIsOpened(false); }

	const value: OpenCloseContextProps =
	{
		isOpened,
		open,
		close
	}

	return (
		<OpenCloseContextProvider value={value}>
			{children}
		</OpenCloseContextProvider>
	)

}

export const withOpenCloseDefaultProvider = createHigherOrderComponent((Origin) => props =>
{
	return (
		<OpenCloseDefaultProvider>
			<Origin {...props} />
		</OpenCloseDefaultProvider>
	)
}, 'withOpenCloseProvider');



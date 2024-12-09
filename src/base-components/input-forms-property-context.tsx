import { createContext, useContext } from '@wordpress/element';

const PropertyContext = createContext({} as any);
export const PropertyContextProvider = PropertyContext.Provider;
export const usePropertyContext = () => useContext(PropertyContext);

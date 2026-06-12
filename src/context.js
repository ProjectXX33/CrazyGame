import { createContext, useContext } from 'react'

export const ShopContext = createContext(null)
export const useShop = () => useContext(ShopContext)

export const EGP = (n) => 'EGP ' + n.toLocaleString('en-US')

export const PLAT_LABEL = { 'PS5': 'PS5', 'PS4': 'PS4', 'Switch 2': 'SW2', 'Switch': 'SW', 'Xbox': 'XBX' }

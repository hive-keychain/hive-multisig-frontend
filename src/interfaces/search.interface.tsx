import { Authorities  } from "./account.interface"

export interface ISearchBarInterface  {
    username?: string,
    isValid?: boolean
}
export interface ISearchPageInterface  {
    username?: string,
    isValid?: boolean,
    authorities?:Authorities
}

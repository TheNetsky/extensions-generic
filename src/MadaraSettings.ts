/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    RequestManager,
    Button
} from 'paperback-extensions-common'


export const clearCookies = (requestManager: RequestManager): Button => {
    return createButton({
        id: 'clear_madara_cookies',
        value: '',
        label: 'Clear Cookies',

        onTap: async () => {
            try {
                // @ts-ignore
                requestManager.cookieStore.getAllCookies().forEach(x => { requestManager.cookieStore.removeCookie(x) })
            } catch (error) {
                console.log(error)
            }
        }
    })

}
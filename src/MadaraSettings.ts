/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    SourceStateManager,
    RequestManager,
    NavigationButton
} from 'paperback-extensions-common'

import rUserAgent from 'random-useragent'

export const getHQThumbnailSetting = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('HQthumb') as boolean) ?? false
}

export const sourceSettings = (stateManager: SourceStateManager, requestManager: RequestManager, source: any): NavigationButton => {
    return createNavigationButton({
        id: 'madara_settings',
        value: '',
        label: 'Source Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('HQthumb', values.HQthumb)
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    // User Agent Section
                    createSection({
                        id: 'ua_section',
                        footer: 'If you\'re experiencing issues with CloudFlare, try randomizing your User Agent.\nPlease restart your app after doing so.',
                        rows: async () => [
                            createLabel({
                                id: 'current_ua',
                                value: !source.userAgent ? 'Not allowed to change' :
                                    (typeof source.userAgent == 'string') ? source.userAgent :
                                        await stateManager.retrieve('userAgent') as string ?? 'Default',
                                label: 'Current User Agent: '
                            }),
                            createButton({
                                id: 'randomise_ua',
                                label: 'Randomise UserAgent & Clear Cookies',
                                value: undefined,
                                onTap: async () => {
                                    try {
                                        // Clear Cookies
                                        // @ts-ignore
                                        requestManager.cookieStore.getAllCookies().forEach(x => { requestManager.cookieStore.removeCookie(x) })

                                        // Use set UserAgent unless one is manually set in the source
                                        if (typeof source.userAgent !== 'string') {
                                            stateManager.store('userAgent', rUserAgent.getRandom())
                                        }

                                    } catch (error) {
                                        console.log(error)
                                    }
                                }
                            })
                        ]
                    }),

                    // HQ Thumbnail Section
                    createSection({
                        id: 'content',
                        footer: 'Enabling HQ thumbnails will use more bandwidth and will load thumbnails slightly slower.',
                        rows: () => {
                            return Promise.all([
                                getHQThumbnailSetting(stateManager)
                            ]).then(async values => {
                                return [
                                    createSwitch({
                                        id: 'HQthumb',
                                        label: 'HQ Thumbnails',
                                        value: values[0]
                                    }),
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}

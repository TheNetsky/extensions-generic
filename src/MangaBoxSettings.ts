/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    NavigationButton,
    SourceStateManager
} from 'paperback-extensions-common'

export const getImageServer = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('image_server') as string) ?? 'server1'
}

export const imageServerSettings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'image_server_settings',
        value: '',
        label: 'Image Server Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.resolve(stateManager.store('image_server', values.image_server[0]))
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'image_server_section',
                        rows: () => {
                            return Promise.resolve(getImageServer(stateManager)).then(async value => {
                                return [
                                    createSelect({
                                        id: 'image_server',
                                        label: 'Image Server',
                                        options: ['server1', 'server2'],
                                        displayLabel: option => (option == 'server1' ? 'Server 1' : 'Server 2'),
                                        value: [value],
                                        allowsMultiselect: false,
                                        minimumOptionCount: 1,
                                    })
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}
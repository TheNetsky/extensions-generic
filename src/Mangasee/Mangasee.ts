import {
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import { NepNep } from '../NepNep'

export const MANGASEE_DOMAIN = 'https://mangasee123.com'

export const MangaseeInfo: SourceInfo = {
    version: '2.2.0',
    name: 'MangaSee',
    icon: 'icon.png',
    author: 'Daniel Kovalevich',
    authorWebsite: 'https://github.com/DanielKovalevich',
    description: 'Extension that pulls manga from MangaSee, includes Advanced Search and Updated manga fetching',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGASEE_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class Mangasee extends NepNep {
    baseUrl = 'https://mangasee123.com'
}
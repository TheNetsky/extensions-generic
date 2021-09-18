import {
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import { NepNep } from '../NepNep'

export const MANGALIFE_DOMAIN = 'https://manga4life.com'

export const MangaLifeInfo: SourceInfo = {
    version: '2.2.0',
    name: 'Manga4Life',
    icon: 'icon.png',
    author: 'Daniel Kovalevich',
    authorWebsite: 'https://github.com/DanielKovalevich',
    description: 'Extension that pulls manga from MangaLife, includes Advanced Search and Updated manga fetching',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGALIFE_DOMAIN,
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

export class MangaLife extends NepNep {
    baseUrl = 'https://manga4life.com'
}
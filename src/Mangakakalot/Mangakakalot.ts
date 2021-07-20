/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    ContentRating,
    LanguageCode,
    MangaTile,
    MangaUpdates,
    PagedResults,
    SearchRequest,
    SourceInfo,
    Tag,
    TagSection,
    TagType
} from 'paperback-extensions-common'
import {
    MangaBox,
    getExportVersion
} from '../MangaBox'
import {
    isLastPage,
    parseMangaList,
    decodeHTMLEntity
} from '../MangaBoxParser'
import { URLBuilder } from '../MangaBoxHelper'

const MANGAKAKALOT_DOMAIN = 'https://mangakakalot.com'

export const MangakakalotInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Mangakakalot',
    description: 'Extension that pulls manga from mangakakalot.com',
    author: 'nar1n',
    authorWebsite: 'https://github.com/nar1n',
    icon: 'mangakakalot.com.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANGAKAKALOT_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class Mangakakalot extends MangaBox {
    baseUrl: string = MANGAKAKALOT_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

    override parseTagUrl(url: string): string|undefined {
        return url.split('category=').pop()?.split('&')[0]?.replace(/[^0-9]/g, '')
    }

    override mangaListPath = 'manga_list'
    override mangaListSelector = 'div.truyen-list div.list-truyen-item-wrap'
    override mangaListSubtitleSelector = 'a.list-story-item-wrap-chapter'

    override mangaListPagination(url: URLBuilder, page: number): URLBuilder {
        return url.addQueryParameter('page', page)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        const request = createRequestObject({
            url: this.baseUrl,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const updatedManga: string[] = []
        for (const manga of $('div.doreamon div.itemupdate').toArray()) {
            const id = $('a', manga).first().attr('href')
            const mangaDate = this.convertTime($('i', manga).first().text())
            if (!id) continue
            if (mangaDate > time) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            }
        }

        mangaUpdatesFoundCallback(createMangaUpdates({ids: updatedManga}))
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: this.baseUrl,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        
        const arrayTags: Tag[] = []
        for (const tag of $('tbody a').toArray()) {
            const label = $(tag).text().trim()
            const id = this.parseTagUrl($(tag).attr('href') ?? '')
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
        return tagSections
    }

    override async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let results: MangaTile[] = []

        if (query.includedTags) {
            const request = createRequestObject({
                url: new URLBuilder(this.baseUrl)
                    .addPathComponent('manga_list')
                    .addQueryParameter('category', query.includedTags[0]?.id)
                    .addQueryParameter('page', page)
                    .buildUrl(),
                method: 'GET'
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)
            results = parseMangaList($, this)

            metadata = !isLastPage($) ? { page: page + 1 } : undefined

        } else {
            const request = createRequestObject({
                url: new URLBuilder(this.baseUrl)
                    .addPathComponent('search')
                    .addPathComponent('story')
                    .addPathComponent(query.title?.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, '_').toLowerCase() ?? '')
                    .addQueryParameter('page', page)
                    .buildUrl(),
                method: 'GET'
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)

            for (const manga of $('div.panel_story_list div.story_item').toArray()) {
                const title = $('img', manga).first().attr('alt')
                const id = $('a', manga).first().attr('href')
                const image = $('img', manga).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
                const subtitle = $('em.story_chapter', manga).first().text().trim()
                if (!id || !title) continue
                results.push(createMangaTile({
                    id: id,
                    image: image,
                    title: createIconText({ text: decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: subtitle }),
                }))
            }
            metadata = !isLastPage($) ? { page: page + 1 } : undefined
        }
        return createPagedResults({
            results,
            metadata
        })
    }
}
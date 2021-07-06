/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    MangaUpdates,
    TagSection,
    RequestHeaders,
    LanguageCode,
    Section
} from 'paperback-extensions-common'
import {
    parseTags,
    isLastPage,
    parseMangaList,
    parseUpdatedManga,
    parseChapterDetails,
    parseChapters,
    parseMangaDetails,
    UpdatedManga
} from './MangaBoxParser'
import { URLBuilder } from './MangaBoxHelper'
import {
    getImageServer,
    imageServerSettings
} from './MangaBoxSettings'

const BASE_VERSION = '3.0.1'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class MangaBox extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 3
    })

    /**
     * The base URL of the website. Eg. https://manganato.com
     */
    abstract baseUrl: string

    /**
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode

    /**
     * Main selector for getMangaDetails.
     */
    mangaDetailsMainSelector = 'div.manga-info-top, div.panel-story-info'

    /**
     * Selector for manga thumbnail.
     */
    thumbnailSelector = 'div.manga-info-pic img, span.info-image img'

    /**
     * Selector for manga description.
     */
    descriptionSelector = 'div#noidungm, div#panel-story-info-description'

    /**
     * Function to parse tag URL.
     */
    parseTagUrl(url: string): string|undefined {
        return url.split('-').pop()
    }

    override getMangaShareUrl(mangaId: string): string {
        return `${mangaId}`
    }

    /**
     * Selector for chapter list.
     */
    chapterListSelector = 'div.chapter-list div.row, ul.row-content-chapter li'

    /**
     * Path for manga list.
     * Eg. for https://manganato.com/genre-all the path is 'genre-all'
     */
    mangaListPath = 'genre-all'

    /**
     * Selector for manga in manga list
     */
    mangaListSelector = 'div.panel-content-genres div.content-genres-item'

    /**
     * Selector for subtitle in manga list
     */
    mangaListSubtitleSelector = 'a.genres-item-chap.text-nowrap'

    /**
     * Selector for the time updated in manga list
     */
    mangaListTimeSelector = 'span.genres-item-time'

    mangaListPagination(url: URLBuilder, page: number): URLBuilder {
        return url.addPathComponent(page.toString())
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${chapterId}`,
            method: 'GET',
            cookies: [
                createCookie({
                    name: 'content_server',
                    value: await getImageServer(this.stateManager),
                    domain: chapterId.match(/(.*)\/.*\/.*$/g)![0] ?? this.baseUrl
                })
            ]
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1
        let updatedManga: UpdatedManga = {
            ids: [],
            loadMore: true
        }

        while (updatedManga.loadMore) {
            const request = createRequestObject({
                url: this.mangaListPagination(
                    new URLBuilder(this.baseUrl)
                        .addPathComponent(this.mangaListPath)
                        .addQueryParameter('type', 'latest'),
                    page).buildUrl(),
                method: 'GET',
            })

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)

            updatedManga = parseUpdatedManga($, time, ids, this)
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }))
            }
            updatedManga.ids = []
            page++
        }
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: new URLBuilder(this.baseUrl)
                        .addPathComponent(this.mangaListPath)
                        .addQueryParameter('type', 'latest')
                        .buildUrl(),
                    method: 'Get'
                }),
                section: createHomeSection({
                    id: 'latest',
                    title: 'Latest Updates',
                    view_more: true
                })
            },
            {
                request: createRequestObject({
                    url: new URLBuilder(this.baseUrl)
                        .addPathComponent(this.mangaListPath)
                        .addQueryParameter('type', 'topview')
                        .buildUrl(),
                    method: 'Get'
                }),
                section: createHomeSection({
                    id: 'topview',
                    title: 'Hot Manga',
                    view_more: true
                })
            },
            {
                request: createRequestObject({
                    url: new URLBuilder(this.baseUrl)
                        .addPathComponent(this.mangaListPath)
                        .addQueryParameter('type', 'newest')
                        .buildUrl(),
                    method: 'Get'
                }),
                section: createHomeSection({
                    id: 'newest',
                    title: 'Newest Manga',
                    view_more: true
                })
            }
        ]
        const promises: Promise<void>[] = []

        for (const section of sections) {
            // Let the app load empty sections
            sectionCallback(section.section)

            promises.push(this.requestManager.schedule(section.request, 1).then(async response => {
                const $ = this.cheerio.load(response.data)
                section.section.items = parseMangaList($, this)
                sectionCallback(section.section)
            }))
        }

        // Make sure the function completes
        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: this.mangaListPagination(
                new URLBuilder(this.baseUrl)
                    .addPathComponent(this.mangaListPath)
                    .addQueryParameter('type', homepageSectionId),
                page).buildUrl(),
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseMangaList($, this)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const request = createRequestObject({
            url: new URLBuilder(this.baseUrl)
                .addPathComponent('advanced_search')
                .addQueryParameter('keyw', query.title?.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, '_').toLowerCase())
                .addQueryParameter('g_i', `_${query.includedTags?.map(x => x.id).join('_')}_`)
                .addQueryParameter('page', page)
                .buildUrl(),
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseMangaList($, this)
        metadata = !isLastPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: new URLBuilder(this.baseUrl)
                .addPathComponent('advanced_search')
                .buildUrl(),
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseTags($)
    }

    override globalRequestHeaders(): RequestHeaders {
        return {
            referer: this.baseUrl
        }
    }

    protected convertTime(timeAgo: string): Date {
        let time: Date
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0])
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000)
        } else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000)
        } else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000)
        } else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000)
        } else {
            time = new Date(timeAgo)
        }

        return time
    }

    stateManager = createSourceStateManager({})

    override async getSourceMenu(): Promise<Section> {
        return Promise.resolve(createSection({
            id: 'main',
            header: 'Source Settings',
            rows: () => Promise.resolve([
                imageServerSettings(this.stateManager)
            ])
        }))
    }
}
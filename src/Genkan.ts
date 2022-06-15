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
    LanguageCode,
    Request,
    Response,
} from 'paperback-extensions-common'
import {
    GenkanParser,
    UpdatedManga
} from './GenkanParser'

const BASE_VERSION = '1.0.0'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class Genkan extends Source {
    readonly requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 30000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        ...(this.userAgent && { 'user-agent': this.userAgent }),
                        'referer': `${this.baseUrl}/`
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    parser = new GenkanParser();

    abstract baseUrl: string

    abstract languageCode: LanguageCode

    DefaultUrlDirectory = 'comics'

    serieslDirectory = 'comics'

    countryOfOriginSelector = '.card.mt-2 .list-item:contains(Country of Origin) .no-wrap'

    userAgent = ''

    parseTagUrl(url: string): string | undefined {
        return url.split('-').pop()
    }

    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/${this.DefaultUrlDirectory}/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.serieslDirectory}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser .parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.serieslDirectory}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.serieslDirectory}/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapterDetails($, mangaId, chapterId, this)
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: `${this.baseUrl}/latest?page=1`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: '1',
                    title: 'Latest Updates',
                    view_more: true,
                }),
                isLatest: true
            },
            {
                request: createRequestObject({
                    url: `${this.baseUrl}/${this.DefaultUrlDirectory}?page=1`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: '2',
                    title: 'Popular Series',
                    view_more: true,
                }),
                isLatest: false
            }
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    const $ = this.cheerio.load(response.data)
                    section.section.items = this.parser.parseMangaList($, this, section.isLatest)
                    sectionCallback(section.section)
                }),
            )

        }

        await Promise.all(promises)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1
        let updatedManga: UpdatedManga = {
            ids: [],
            loadMore: true
        }

        while (updatedManga.loadMore) {
            const request = createRequestObject({
                url: `${this.baseUrl}/latest?page=${page++}`,
                method: 'GET',
            })

            const data = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(data.data)

            updatedManga = this.parser.parseUpdatedManga($, time, ids, this)
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }))
            }
        }
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let param = ''
        let isLatest = false
        switch (homepageSectionId) {
            case '1':
                param = `/latest?page=${page}`
                isLatest = true
                break
            case '2':
                param = `/${this.DefaultUrlDirectory}?page=${page}`
                isLatest = false
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }
        
        const request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            param
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const manga = this.parser.parseMangaList($, this, isLatest)
        page++

        if (!this.parser.NextPage($)) page = -1

        return createPagedResults({
            results: manga,
            metadata: {
                page
            }
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        if (!query.title) return createPagedResults({ results: [], metadata: { page: -1 } })

        const request = createRequestObject({
            url: `${this.baseUrl}/${this.DefaultUrlDirectory}?query=${this.normalizeSearchQuery(query.title) ?? ''}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseMangaList($, this, false)

        page++
        if (!this.parser.NextPage($)) page = -1

        return createPagedResults({
            results: manga,
            metadata: {
                page
            }
        })
    }

    override getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: {
                ...(this.userAgent && { 'user-agent': this.userAgent }),
            }
        })
    }

    protected normalizeSearchQuery(query: any) {
        query = query.toLowerCase()
        query = query.replace(/[àáạảãâầấậẩẫăằắặẳẵ]+/g, 'a')
        query = query.replace(/[èéẹẻẽêềếệểễ]+/g, 'e')
        query = query.replace(/[ìíịỉĩ]+/g, 'i')
        query = query.replace(/[òóọỏõôồốộổỗơờớợởỡ]+/g, 'o')
        query = query.replace(/[ùúụủũưừứựửữ]+/g, 'u')
        query = query.replace(/[ỳýỵỷỹ]+/g, 'y')
        query = query.replace(/[đ]+/g, 'd')
        query = query.replace(/ /g, '+')
        query = query.replace(/%20/g, '+')
        return query
    }
}

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
    NextPage,
    parseMangaList,
    parseUpdatedManga,
    parseChapterDetails,
    parseChapters,
    parseMangaDetails,
} from './GenkanParser'
const BASE_VERSION = '1.0.2'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class Genkan extends Source {
    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
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
    abstract baseUrl: string
    abstract languageCode: LanguageCode
     
    DefaultUrlDirectory = 'comics'
    SerieslDirectory = 'comics'
    countryOfOriginSelector = '.card.mt-2 .list-item:contains(Country of Origin) .no-wrap'
    isHentaiSelector = '.card.mt-2 .list-item:contains(Mature (18+)) .no-wrap'
    userAgent = ''

    parseTagUrl(url: string): string|undefined {
        return url.split('-').pop()
    }

    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/${this.DefaultUrlDirectory}/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.SerieslDirectory}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.SerieslDirectory}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapters($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.SerieslDirectory}/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return parseChapterDetails($, mangaId, chapterId,this)
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
            },
        ]
        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    const $ = this.cheerio.load(response.data)
                    section.section.items = parseMangaList($, this,section.isLatest)
                    sectionCallback(section.section)
                }),
            )

        }
        await Promise.all(promises)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1
        let loadNextPage = true
        while (loadNextPage) {
            const request = createRequestObject({
                url: `${this.baseUrl}/latest?page=${page}`,
                method: 'GET',
            })

            const data = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(data.data)

            const updatedManga = parseUpdatedManga($, time, ids, this)
            loadNextPage = updatedManga.loadNextPage && !NextPage($)
            if (loadNextPage) {
                page++
            }
            if (updatedManga.updates.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.updates
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
        const collectedIds: string[] = []
        const manga = parseMangaList($, this,isLatest,collectedIds)
        page++
        if (!NextPage($)) page = -1

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
        if(!query.title) return createPagedResults({ results: [], metadata: { page: -1 } })
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.DefaultUrlDirectory}?query=${query.title.replace(/%20/g, '+').replace(/ /g,'+') ?? ''}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseMangaList($, this,false)
        page++
        if (!NextPage($)) page = -1

        return createPagedResults({
            results: manga,
            metadata:{
                page
            }
        })
    }
    
    protected convertTime(date: string): Date {
        let time: Date
        let number = Number((/\d*/.exec(date.trim()) ?? [])[0])
        number = (number == 0 && date.includes('a')) ? 1 : number
        if (date.includes('mins') || date.includes('minutes') || date.includes('minute')) {
            time = new Date(Date.now() - number * 60000)
        } else if (date.includes('hours') || date.includes('hour')) {
            time = new Date(Date.now() - number * 3600000)
        } else if (date.includes('days') || date.includes('day')) {
            time = new Date(Date.now() - number * 86400000)
        } else if (date.includes('weeks') || date.includes('week')) {
            time = new Date(Date.now() - number * 604800000)
        } else if (date.includes('months') || date.includes('month')) {
            time = new Date(Date.now() - number * 2548800000)
        } else if (date.includes('years') || date.includes('year')) {
            time = new Date(Date.now() - number * 31556952000)
        } else {
            time = new Date(date)
        }

        return time
    }

    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: {
                ...(this.userAgent && { 'user-agent': this.userAgent }),
            }
        })
    }

}
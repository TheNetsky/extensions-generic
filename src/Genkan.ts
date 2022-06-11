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
    NextPage,
    parseMangaList,
    parseUpdatedManga,
    parseChapterDetails,
    parseChapters,
    parseMangaDetails,
} from './GenkanParser'
const BASE_VERSION = '1.0.1'
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
            },
        ]
        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    const $ = this.cheerio.load(response.data)
                    section.section.items = parseMangaList($, this)
                    sectionCallback(section.section)
                }),
            )

        }
        await Promise.all(promises)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page: number = 1
        let loadNextPage = true
        while (loadNextPage) {
            const request = createRequestObject({
                url: `${this.baseUrl}/latest?page=${page}`,
                method: 'GET',
            })

            let data = await this.requestManager.schedule(request, 1)
            let $ = this.cheerio.load(data.data)

            let updatedManga = parseUpdatedManga($, time, ids, this)
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
        switch (homepageSectionId) {
            case '1':
                param = `/latest?page=${page}`
                break
            case '2':
                param = `/${this.DefaultUrlDirectory}?page=${page}`
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
        let collectedIds: string[] = []
        const manga = parseMangaList($, this,collectedIds)
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
            url: `${this.baseUrl}/${this.DefaultUrlDirectory}?query=${this.normalizeSearchQuery(query.title) ?? ''}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = parseMangaList($, this)
        page++
        if (!NextPage($)) page = -1

        return createPagedResults({
            results: manga,
            metadata:{
                page
            }
        })
    }
    protected normalizeSearchQuery(query: any) {
        var query = query.toLowerCase();
        query = query.replace(/[àáạảãâầấậẩẫăằắặẳẵ]+/g, 'a');
        query = query.replace(/[èéẹẻẽêềếệểễ]+/g, 'e');
        query = query.replace(/[ìíịỉĩ]+/g, 'i');
        query = query.replace(/[òóọỏõôồốộổỗơờớợởỡ]+/g, 'o');
        query = query.replace(/[ùúụủũưừứựửữ]+/g, 'u');
        query = query.replace(/[ỳýỵỷỹ]+/g, 'y');
        query = query.replace(/[đ]+/g, 'd');
        query = query.replace(/ /g,'+');
        query = query.replace(/%20/g, '+');
        return query;
        
    }
    protected convertTime(timeAgo: string): Date {
        let time: Date
        let trimmed: number = Number((/\d*/.exec(timeAgo.trim()) ?? [])[0])
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000)
        } else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000)
        } else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000)
        } else if (timeAgo.includes('weeks') || timeAgo.includes('week')) {
            time = new Date(Date.now() - trimmed * 604800000)
        } else if (timeAgo.includes('months') || timeAgo.includes('month')) {
            time = new Date(Date.now() - trimmed * 2548800000)
        } else if (timeAgo.includes('years') || timeAgo.includes('year')) {
            time = new Date(Date.now() - trimmed * 31556952000)
        } else {
            time = new Date(timeAgo)
        }

        return time
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

}
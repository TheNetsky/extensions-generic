/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Chapter,
    ChapterDetails,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    PagedResults,
    SearchRequest,
    Source,
    MangaUpdates,
    Request,
    Response,
    TagSection
} from 'paperback-extensions-common'

import { Parser } from './FMReaderParser'


export abstract class FMReader extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    'referer': `${this.baseUrl}/`,
                    'user-agent': this.userAgent ?? request.headers?.['user-agent']
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });
    userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1'
    abstract baseUrl: string
    adult: boolean = false

    requestPath:string = "manga-list.html"

    popularSort: string = "sort=views"

    
    headerSelector: string = "h3 a, .series-title a"

    chapterUrlSelector: string = "a"

    chapterTimeSelector: string = "time, .chapter-time, .publishedDate"

    chapterDetailsImageSelector: string = "img.chapter-img"
    sourceTraversalPathName = 'manga'
    /*
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode


    parser = new Parser()

    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${chapterId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId, this)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let request
        if (query.title) {
        request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&name=${query.title}&page=${page}`,
            method: 'GET',
        })
       } else {
        request = createRequestObject({
            url: `${this.baseUrl}/manga-list-genre-${query?.includedTags?.map((x: any) => x.id)[0]}.html`,
            method: 'GET',
        })
    }
        const data = await this.requestManager.schedule(request, 2)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($, this)

        page++
        if (!this.parser.NextPage($)) page = -1

        return createPagedResults({
            results: manga,
            metadata: { page: page },
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        let request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&page=1&${this.popularSort}&sort_type=DESC`,
            method: 'GET',
        })
        let response = await this.requestManager.schedule(request, 2)
        
        const popular = this.cheerio.load(response.data)

        request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&page=1&sort=last_update&sort_type=DESC`,
            method: 'GET',
        })
        response = await this.requestManager.schedule(request, 2)
        const latest = this.cheerio.load(response.data)
        this.CloudFlareError(response.status)
        await this.parser.parseHomeSections(popular, latest, sectionCallback, this)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let param = ''
        switch (homepageSectionId) {
            case '1':
                param = `/${this.requestPath}?listType=pagination&page=${page}&sort=last_update&sort_type=DESC`
                break
            case '2':
                param = `/${this.requestPath}?listType=pagination&page=${page}&${this.popularSort}&sort_type=DESC`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }
        const request = createRequestObject({
            url: `${this.baseUrl}${param}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseSearchResults($, this)

        page++
        if (!this.parser.NextPage($)) page = -1
        return createPagedResults({
            results: manga,
            metadata: { page: page }
        })
    }
    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page: number = 1;
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&page=${page}&sort=last_update&sort_type=DESC`,
            method: 'GET',
        })
        const data = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(data.data)

        const updatedManga = this.parser.filterUpdatedManga($, time, ids, this)
        page++;
        if (updatedManga.length > 0) {
            mangaUpdatesFoundCallback(
                createMangaUpdates({
                    ids: updatedManga,
                })
            )
        }
    }
    override async getSearchTags(): Promise<TagSection[]> {
        const options = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status)
        let $ = this.cheerio.load(response.data);
        return [createTagSection({
            id: "genres",
            label: "Genres",
            tags: this.parser.parseTags($)
        })];
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     * Copied from Madara.ts made by gamefuzzy
     */
     protected parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        let number: number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
            time = new Date(Date.now())
        } else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            time = new Date(date)
        }
        return time
    }

    parseStatus(str: string): MangaStatus {
        let status = MangaStatus.UNKNOWN

        switch (str.toLowerCase()) {
            case 'ongoing':
                status = MangaStatus.ONGOING
                break
            case 'completed':
                status = MangaStatus.COMPLETED
                break
        }
        return status
    }

    override getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: {
                referer: `${this.baseUrl}/`,
                "user-agent": this.userAgent 
            }
        })
    }
    CloudFlareError(status: any) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > \<\The name of this source\> and press Cloudflare Bypass')
        }
    }
}

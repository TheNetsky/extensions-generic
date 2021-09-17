import {
    Chapter,
    ChapterDetails,
    HomeSection,
    Manga,
    MangaUpdates,
    PagedResults,
    RequestHeaders,
    SearchRequest,
    Source,
    TagSection,
    Request,
    SearchField
} from 'paperback-extensions-common'
import { Parser } from './Parser'

const headers = { 'content-type': 'application/x-www-form-urlencoded' }
const method = 'GET'

export abstract class NepNep extends Source {

    abstract baseUrl: string

    parser = new Parser()

    requestManager = createRequestManager({
        requestsPerSecond: 0.5,
        requestTimeout: 15000
    })

    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/manga/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/manga/`,
            method,
            param: mangaId
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/manga/`,
            method,
            headers,
            param: mangaId
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/read-online/`,
            headers,
            method,
            param: chapterId
        })

        const response = await this.requestManager.schedule(request, 1)
        return this.parser.parseChapterDetails(response.data, mangaId, chapterId)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        const request = createRequestObject({
            url: `${this.baseUrl}/`,
            headers,
            method,
        })

        const response = await this.requestManager.schedule(request, 1)
        const returnObject = this.parser.parseUpdatedManga(response.data, time, ids)
        mangaUpdatesFoundCallback(createMangaUpdates(returnObject))
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        if(!metadata) { 
            const request = createRequestObject({
                url: `${this.baseUrl}/search/`,
                headers,
                method,
            })

            const searchMetadata = this.parser.searchMetadata(query)

            const response = await this.requestManager.schedule(request, 1)

            metadata = {
                manga: this.parser.parseSearch(response.data, searchMetadata),
                offset: 0
            }
        }
        
        return createPagedResults({
            results: metadata.manga.slice(metadata.offset, metadata.offset + 100),
            metadata: {
                manga: metadata.manga,
                offset: metadata.offset + 100
            }
        })
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/search/`,
            headers,
            method,
        })

        const response = await this.requestManager.schedule(request, 1)
        return this.parser.parseSearchTags(response.data)
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    override async getSearchFields(): Promise<SearchField[]> {
        return this.parser.parseSearchFields()
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${this.baseUrl}`,
            method,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        this.parser.parseHomeSections($, response.data, sectionCallback)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        if(!metadata) { 
            const request = createRequestObject({
                url: this.baseUrl,
                method,
            })
            const response = await this.requestManager.schedule(request, 1)

            metadata = {
                manga: this.parser.parseViewMore(response.data, homepageSectionId),
                offset: 0
            }
        }
        return createPagedResults({
            results: metadata.manga.slice(metadata.offset, metadata.offset + 100),
            metadata: {
                manga: metadata.manga,
                offset: metadata.offset + 100
            }
        })
    }

    override globalRequestHeaders(): RequestHeaders {
        return {
            referer: this.baseUrl + '/'
        }
    }

    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
        })
    }
}

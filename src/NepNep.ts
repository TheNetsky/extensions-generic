import {
    Chapter,
    ChapterDetails,
    HomeSection,
    SourceManga,
    PagedResults,
    SearchRequest,
    TagSection,
    Request,
    Response,
    SearchField,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding
} from '@paperback/types'

import {Parser} from './Parser'

const headers = {'content-type': 'application/x-www-form-urlencoded'}

export abstract class NepNep implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
    abstract baseUrl: string;
    parser = new Parser();

    constructor(private cheerio: CheerioAPI) { }

    requestManager = App.createRequestManager({
        requestsPerSecond: 0.5,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${this.baseUrl}/`,
                        'user-agent': await this.requestManager.getDefaultUserAgent()
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });

    getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/manga/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${this.baseUrl}/manga/`,
            method: 'GET',
            param: mangaId
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${this.baseUrl}/manga/`,
            method: 'GET',
            headers,
            param: mangaId
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        return this.parser.parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${this.baseUrl}/read-online/`,
            headers,
            method: 'GET',
            param: chapterId
        })
        const response = await this.requestManager.schedule(request, 1)
        return this.parser.parseChapterDetails(response.data, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        if (!metadata) {
            const request = App.createRequest({
                url: `${this.baseUrl}/search/`,
                headers,
                method: 'GET'
            })
            const searchMetadata = this.parser.searchMetadata(query)
            const response = await this.requestManager.schedule(request, 1)
            metadata = {
                manga: this.parser.parseSearch(response.data, searchMetadata),
                offset: 0
            }
        }
        return App.createPagedResults({
            results: metadata.manga.slice(metadata.offset, metadata.offset + 100),
            metadata: {
                manga: metadata.manga,
                offset: metadata.offset + 100
            }
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${this.baseUrl}/search/`,
            headers,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        return this.parser.parseSearchTags(response.data)
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    async getSearchFields(): Promise<SearchField[]> {
    // Uncomment when this actually works in-app
    //return this.parser.parseSearchFields()
        return []
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: `${this.baseUrl}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        this.parser.parseHomeSections($, response.data, sectionCallback)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        if (!metadata) {
            const request = App.createRequest({
                url: this.baseUrl,
                method: 'GET'
            })
            const response = await this.requestManager.schedule(request, 1)
            metadata = {
                manga: this.parser.parseViewMore(response.data, homepageSectionId),
                offset: 0
            }
        }
        return App.createPagedResults({
            results: metadata.manga.slice(metadata.offset, metadata.offset + 100),
            metadata: {
                manga: metadata.manga,
                offset: metadata.offset + 100
            }
        })
    }

    getCloudflareBypassRequest(): Request {
        return App.createRequest({
            url: `${this.baseUrl}`,
            method: 'GET'
        })
    }
}

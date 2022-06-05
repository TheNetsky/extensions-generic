/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Chapter,
    ChapterDetails,
    HomeSection,
    LanguageCode,
    Manga,
    PagedResults,
    SearchRequest,
    Source,
    Request,
    Response,
    TagSection
} from 'paperback-extensions-common'

import { Parser } from './BentaiParser'

// Set the version for the base, changing this version will change the versions of all sources
const BASE_VERSION = '1.0.0'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class Bentai extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 5,
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


    /**
     * The URL of the website. Eg. https://mangadark.com without a trailing slash
     */
    abstract baseUrl: string

    /*
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode


    /*
     * The userAgent used to requests
     */
    userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1'

    fallbackImage = 'https://i.imgur.com/GYUxEX8.png'

    imageCDN = ''

    directoryGallerySelector = 'div.row.galleries'

    directorySubtitleSelector = 'h3.gallery_cat' 

    directorySkipFirst = false

    directoryPageParam = '?page='

    directorySearchParam = '?key='

    tagBoxSelector = 'div.row.stags'

    parser = new Parser()

    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/gallery/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/gallery/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/gallery/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        if (!this.imageCDN) {
            throw new Error('No CDN provided for chapterDetails')
        }

        const request = createRequestObject({
            url: `${this.baseUrl}/gallery/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId, this)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let request

        //Regular search
        if (query.title) {
            request = createRequestObject({
                url: `${this.baseUrl}/search/${this.directorySearchParam}${encodeURI(query.title ?? '')}&page=${page}`,
                method: 'GET'
            })

            //Tag Search
        } else {
            request = createRequestObject({
                url: `${this.baseUrl}/tag/${query?.includedTags?.map((x: any) => x.id)[0]}/${this.directoryPageParam}${page}`,
                method: 'GET'
            })
        }

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseDirectory($, this)

        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: this.baseUrl,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 2)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        this.parser.parseHomeSections($, sectionCallback, this)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        homepageSectionId //Ignore this

        const page: number = metadata?.page ?? (this.directorySkipFirst ? 2 : 1)

        const request = createRequestObject({
            url: `${this.baseUrl}/${this.directoryPageParam}${page}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        const manga = this.parser.parseDirectory($, this)
        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const options = createRequestObject({
            url: `${this.baseUrl}/tags/popular`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseTags($, this)
    }

    override getCloudflareBypassRequest() {
        return createRequestObject({
            url: this.baseUrl,
            method: 'GET',
            headers: {
                'referer': `${this.baseUrl}/`,
                'user-agent': this.userAgent
            }
        })
    }

    CloudFlareError(status: any) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass')
        }
    }
}

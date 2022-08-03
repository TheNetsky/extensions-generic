/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Chapter,
    ChapterDetails,
    HomeSection,
    LanguageCode,
    Manga,
    MangaTile,
    MangaUpdates,
    PagedResults,
    SearchRequest,
    Source,
    TagSection,
    Request,
    Response,
    Section
} from 'paperback-extensions-common'

import { Parser } from './MadaraParser'
import { URLBuilder } from './MadaraHelper'

import {
    sourceSettings
} from './MadaraSettings'

const BASE_VERSION = '2.2.1'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

let globalUA: string | null

export abstract class Madara extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        ...(globalUA && { 'user-agent': await this.getUserAgent() }), // Set globalUA intially
                        'referer': `${this.baseUrl}/`
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });


    stateManager = createSourceStateManager({})

    async getUserAgent(): Promise<string> {
        const stateUA = await this.stateManager.retrieve('userAgent') as string

        if (!this.userAgent) {
            globalUA = null
        } else if (typeof this.userAgent == 'string') {
            globalUA = this.userAgent
        } else if (stateUA) {
            globalUA = stateUA
        } else {
            globalUA = null
        }
        return globalUA
    }

    override async getSourceMenu(): Promise<Section> {
        const section = createSection({
            id: 'main',
            header: 'Source Settings',
            footer: 'Change User Agent & Enable HQ Thumbnails',
            rows: async () => [
                sourceSettings(this.stateManager, this.requestManager, this)
            ]
        })
        await this.getUserAgent()
        return section
    }

    /**
     * The Madara URL of the website. Eg. https://webtoon.xyz
     */
    abstract baseUrl: string

    /**
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode

    /**
     * The path that precedes a manga page not including the Madara URL.
     * Eg. for https://www.webtoon.xyz/read/limit-breaker/ it would be 'read'.
     * Used in all functions.
     */
    sourceTraversalPathName = 'manga'

    /**
     * Different Madara sources might have a slightly different selector which is required to parse out
     * each manga object while on a search result page. This is the selector
     * which is looped over. This may be overridden if required.
     */
    searchMangaSelector = 'div.c-tabs-item__content'

    /**
     * Set to true if your source has advanced search functionality built in.
     */
    hasAdvancedSearchPage = false

    /**
     * The path used for search pagination. Used in search function.
     * Eg. for https://mangabob.com/page/2/?s&post_type=wp-manga it would be 'page'
     */
    searchPagePathName = 'page'

    /**
     * Some sites use the alternate URL for getting chapters through ajax
     */
    alternativeChapterAjaxEndpoint = false

    /**
     * Different Madara sources might require a extra param in order for the images to be parsed.
     * Eg. for https://arangscans.com/manga/tesla-note/chapter-3/?style=list "?style=list" would be the param
     * added to the end of the URL. This will set the page in list style and is needed in order for the
     * images to be parsed. Params can be addded if required.
     */
    chapterDetailsParam = ''

    /**
     * Different Madara sources might have a slightly different selector which is required to parse out
     * each page while on a chapter page. This is the selector
     * which is looped over. This may be overridden if required.
     */
    chapterDetailsSelector = 'div.page-break > img'

    /**
    * Set custom User-Agent
    */
    userAgent: string | boolean = true

    parser = new Parser()

    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        if (!isNaN(Number(mangaId))) {
            throw new Error('Migrate your source to the same source but make sure to select include migrated manga. Then while it is migrating, press "Mark All" and Replace.')
        }

        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
            method: 'GET'
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        if (!isNaN(Number(mangaId))) {
            throw new Error('Migrate your source to the same source but make sure to select include migrated manga. Then while it is migrating, press "Mark All" and Replace.')
        }

        const request = createRequestObject({
            url: !this.alternativeChapterAjaxEndpoint ? `${this.baseUrl}/wp-admin/admin-ajax.php` : `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/ajax/chapters`,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                'action': 'manga_get_chapters',
                'manga': await this.getNumericId(mangaId)
            }
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseChapterList($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${chapterId}/`,
            method: 'GET',
            cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl }),createCookie({ name: 'toonily-mature', value: '1', domain: this.baseUrl })],
            param: this.chapterDetailsParam
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId, this.chapterDetailsSelector)

    }

    override async getTags(): Promise<TagSection[]> {
        let request
        if (this.hasAdvancedSearchPage) {
            request = createRequestObject({
                url: `${this.baseUrl}/?s=&post_type=wp-manga`,
                method: 'GET'
            })
        }
        else {
            request = createRequestObject({
                url: `${this.baseUrl}/`,
                method: 'GET'
            })
        }

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        return this.parser.parseTags($, this.hasAdvancedSearchPage)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
        const page = metadata?.page ?? 1

        const request = this.constructSearchRequest(page, query)
        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($, this)

        return createPagedResults({
            results: await manga,
            metadata: { page: (page + 1) }
        })
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
        let page = 0
        let loadNextPage = true
        while (loadNextPage) {
            const request = this.constructAjaxHomepageRequest(page, 50, '_latest_update')

            const data = await this.requestManager.schedule(request, 1)
            this.CloudFlareError(data.status)
            const $ = this.cheerio.load(data.data)

            const updatedManga = this.parser.filterUpdatedManga($, time, ids, this)
            loadNextPage = updatedManga.loadNextPage
            if (loadNextPage) {
                page++
            }
            if (updatedManga.updates.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.updates
                }))
            }
        }
        mangaUpdatesFoundCallback(createMangaUpdates({ ids: [] }))
    }

    /**
     * It's hard to capture a default logic for homepages. So for Madara sources,
     * instead we've provided a homesection reader for the base_url/source_traversal_path/ endpoint.
     * This supports having paged views in almost all cases.
     * @param sectionCallback
     */
    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_latest_update'),
                section: createHomeSection({
                    id: '0',
                    title: 'Recently Updated',
                    view_more: true,
                }),
            },
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_week_views_value'),
                section: createHomeSection({
                    id: '1',
                    title: 'Currently Trending',
                    view_more: true,
                })
            },
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_views'),
                section: createHomeSection({
                    id: '2',
                    title: 'Most Popular',
                    view_more: true,
                })
            },
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_status', 'end'),
                section: createHomeSection({
                    id: '3',
                    title: 'Completed',
                    view_more: true,
                })
            },
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {
            // Let the app load empty sections
            sectionCallback(section.section)

            // Get the section data
            promises.push(
                this.requestManager.schedule(section.request, 1).then(async response => {
                    this.CloudFlareError(response.status)
                    const $ = this.cheerio.load(response.data)
                    section.section.items = await this.parser.parseHomeSection($, this)
                    sectionCallback(section.section)
                }),
            )

        }

        // Make sure the function completes
        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        // We only have one homepage section ID, so we don't need to worry about handling that any
        const page = metadata?.page ?? 0   // Default to page 0
        let sortBy: any[] = []
        switch (homepageSectionId) {
            case '0': {
                sortBy = ['_latest_update']
                break
            }
            case '1': {
                sortBy = ['_wp_manga_week_views_value']
                break
            }
            case '2': {
                sortBy = ['_wp_manga_views']
                break
            }
            case '3': {
                sortBy = ['_wp_manga_status', 'end']
                break
            }
        }

        const request = this.constructAjaxHomepageRequest(page, 50, sortBy[0], sortBy[1])
        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const items: MangaTile[] = await this.parser.parseHomeSection($, this)
        // Set up to go to the next page. If we are on the last page, remove the logic.
        let mData: any = { page: (page + 1) }
        if (items.length < 50) {
            mData = undefined
        }

        return createPagedResults({
            results: items,
            metadata: mData
        })
    }

    override getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: {
                ...(globalUA && { 'user-agent': globalUA }),
            }
        })
    }

    async getNumericId(mangaId: string): Promise<string> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
            method: 'GET'
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1]
        if (!numericId) {
            throw new Error(`Failed to parse the numeric ID for ${mangaId}`)
        }

        return numericId
    }

    /**
     * Constructs requests to be sent to the search page.
     */
    constructSearchRequest(page: number, query: SearchRequest): any {
        return createRequestObject({
            url: new URLBuilder(this.baseUrl)
                .addPathComponent(this.searchPagePathName)
                .addPathComponent(page.toString())
                .addQueryParameter('s', encodeURIComponent(query?.title ?? ''))
                .addQueryParameter('post_type', 'wp-manga')
                .addQueryParameter('genre', query?.includedTags?.map((x: any) => x.id))
                .buildUrl({ addTrailingSlash: true, includeUndefinedParameters: false }),
            method: 'GET',
            cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl }),createCookie({ name: 'toonily-mature', value: '1', domain: this.baseUrl })]
        })
    }

    /**
     * Constructs requests to be sent to the Madara /admin-ajax.php endpoint.
     */
    constructAjaxHomepageRequest(page: number, postsPerPage: number, meta_key: string, meta_value?: string): any {
        return createRequestObject({
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                'action': 'madara_load_more',
                'template': 'madara-core/content/content-archive',
                'page': page,
                'vars[paged]': '1',
                'vars[posts_per_page]': postsPerPage,
                'vars[orderby]': 'meta_value_num',
                'vars[sidebar]': 'right',
                'vars[post_type]': 'wp-manga',
                'vars[order]': 'desc',
                'vars[meta_key]': meta_key,
                'vars[meta_value]': meta_value
            },
            cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl }),createCookie({ name: 'toonily-mature', value: '1', domain: this.baseUrl })]
        })
    }

    CloudFlareError(status: any) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass')
        }
    }
}

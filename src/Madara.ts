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
    RequestHeaders,
    SearchRequest,
    Source,
    TagSection,
} from 'paperback-extensions-common'

import {Parser} from './MadaraParser'

export abstract class Madara extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 3
    })

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
     * Set to false if your source has individual buttons for each page as opposed to a 'LOAD MORE' button
     */
    loadMoreSearchManga = true

    /**
    * Helps with CloudFlare for some sources, makes it worse for others; override with empty string if the latter is true
    */
    userAgentRandomizer = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/78.0${Math.floor(Math.random() * 100000)}`

    parser = new Parser()
    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
            method: 'GET',
            headers: this.constructHeaders({})
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseMangaDetails($, mangaId)
    }


    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: this.constructHeaders({
                'content-type': 'application/x-www-form-urlencoded'
            }),
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
            headers: this.constructHeaders(),
            cookies: [createCookie({name: 'wpmanga-adault', value: '1', domain: this.baseUrl})],
            param: this.chapterDetailsParam
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId, this.chapterDetailsSelector)

    }

    override async getTags(): Promise<TagSection[]> {
        let request
        if(this.hasAdvancedSearchPage) {
            request = createRequestObject({
                url: `${this.baseUrl}/?s=&post_type=wp-manga`,
                method: 'GET',
                headers: this.constructHeaders()
            })
        }
        else {
            request = createRequestObject({
                url: `${this.baseUrl}/`,
                method: 'GET',
                headers: this.constructHeaders()
            })
        }

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        return this.parser.parseTags($, this.hasAdvancedSearchPage)
    }

    async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
        // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
        const page = metadata?.page ?? 0

        const request = this.constructAjaxRequest(page, 50, '', query.title ?? '')
        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($, this)
        let mData: any = {page: (page + 1)}
        if (manga.length < 50) {
            mData = undefined
        }
        return createPagedResults({
            results: manga,
            metadata: typeof mData?.page === 'undefined' ? undefined : mData
        })
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
        let page = 0
        let loadNextPage = true
        while (loadNextPage) {
            const request = this.constructAjaxRequest(page, 50, '_latest_update', '')

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
                request: this.constructAjaxRequest(0, 10, '_latest_update', ''),
                section: createHomeSection({
                    id: '0',
                    title: 'RECENTLY UPDATED',
                    view_more: true,
                }),
            },
            {
                request: this.constructAjaxRequest(0, 10, '_wp_manga_week_views_value', ''),
                section: createHomeSection({
                    id: '1',
                    title: 'CURRENTLY TRENDING',
                    view_more: true,
                })
            },
            {
                request: this.constructAjaxRequest(0, 10, '_wp_manga_views', ''),
                section: createHomeSection({
                    id: '2',
                    title: 'MOST POPULAR',
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
                this.requestManager.schedule(section.request, 1).then(response => {
                    this.CloudFlareError(response.status)
                    const $ = this.cheerio.load(response.data)
                    section.section.items = this.parser.parseHomeSection($, this)
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
        let sortBy = ''
        switch (homepageSectionId) {
            case '0': {
                sortBy = '_latest_update'
                break
            }
            case '1': {
                sortBy = '_wp_manga_week_views_value'
                break
            }
            case '2': {
                sortBy = '_wp_manga_views'
                break
            }
        }
        const request = this.constructAjaxRequest(page, 50, sortBy, '')
        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const items: MangaTile[] = this.parser.parseHomeSection($, this)
        // Set up to go to the next page. If we are on the last page, remove the logic.
        let mData: any = {page: (page + 1)}
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
            headers: this.constructHeaders()
        })
    }

    async getNumericId(mangaId: string): Promise<string> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
            method: 'GET',
            headers: this.constructHeaders()
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
     * Constructs requests to be sent to the Madara /admin-ajax.php endpoint.
     */
    constructAjaxRequest(page: number, postsPerPage: number, meta_key: string, searchQuery: string): any {
        const isSearch = searchQuery != ''
        const data: any = {
            'action': 'madara_load_more',
            'page': page,
            'vars[paged]': '1',
            'vars[posts_per_page]': postsPerPage,
        }
        if (isSearch) {
            data['vars[s]'] = searchQuery
            data['template'] = 'madara-core/content/content-search'
        } else {
            data['template'] = 'madara-core/content/content-archive'
            data['vars[orderby]'] = 'meta_value_num'
            data['vars[sidebar]'] = 'right'
            data['vars[post_type]'] = 'wp-manga'
            data['vars[meta_key]'] = meta_key
            data['vars[order]'] = 'desc'
        }

        return createRequestObject({
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: this.constructHeaders({
                'content-type': 'application/x-www-form-urlencoded'
            }),
            data: data,
            cookies: [createCookie({name: 'wpmanga-adault', value: '1', domain: this.baseUrl})]
        })
    }

    /**
     * Parses a time string from a Madara source into a Date object.
     */
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

    constructHeaders(headers?: any, refererPath?: string): any {
        headers = headers ?? {}
        if(this.userAgentRandomizer !== '') {
            headers['user-agent'] = this.userAgentRandomizer
        }
        headers['referer'] = `${this.baseUrl}${refererPath ?? ''}`
        return headers
    }

    override globalRequestHeaders(): RequestHeaders {
        if(this.userAgentRandomizer !== '') {
            return {
                'referer': `${this.baseUrl}/`,
                'user-agent': this.userAgentRandomizer,
                'accept': 'image/jpeg,image/png,image/*;q=0.8'
            }
        }
        else {
            return {
                'referer': `${this.baseUrl}/`,
                'accept': 'image/jpeg,image/png,image/*;q=0.8'
            }
        }
    }

    CloudFlareError(status: any) {
        if(status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > \<\The name of this source\> and press Cloudflare Bypass')
        }
    }

}

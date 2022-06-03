import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SearchRequest,
    PagedResults,
    MangaUpdates,
    LanguageCode,
    MangaStatus,
    MangaTile,
    Request,
    Response
} from 'paperback-extensions-common'

import entities = require('entities')

const BASE_VERSION = '1.0.1'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class GuyaBase extends Source {

    /**
     * The URL of the website. Eg. https://mangadark.com without a trailing slash
     */
    abstract baseUrl: string

    /**
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode

    /**
     * Fallback image if no image is present
     * Default = "https://i.imgur.com/GYUxEX8.png"
     */
    fallbackImage = 'https://i.imgur.com/GYUxEX8.png'

    //----REQUEST MANAGER----
    requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
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

    override getMangaShareUrl(mangaId: string): string { return `${this.baseUrl}/read/manga/${mangaId}` }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/series/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(data.title)],
            image: data.cover ? this.baseUrl + data.cover : this.fallbackImage,
            status: MangaStatus.ONGOING,
            author: data.author ? data.author : 'Unknown',
            artist: data.artist ? data.artist : 'Unknown',
            desc: this.decodeHTMLEntity(data.description ? data.description : 'N/A'),
        })
    }


    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/series/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const rawChapters = data.chapters

        const chapters = []

        for (const c in rawChapters) {
            const chapter = rawChapters[c]
            for (const group in chapter.groups) {
                chapters.push(createChapter({
                    id: `${c}&&${chapter.folder}&&${group}`,
                    mangaId: mangaId,
                    name: this.decodeHTMLEntity(chapter.title),
                    langCode: this.languageCode,
                    chapNum: isNaN(Number(c)) ? 0 : Number(c),
                    volume: chapter.volume,
                    time: new Date(chapter.release_date[group] * 1000),
                }))
            }
        }

        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/series/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const rawChapters = data.chapters

        const [chapterNum, storage, group] = chapterId.split('&&')

        const pages = []
        const images = rawChapters[Number(chapterNum)].groups[Number(group)]

        for (const image of images) {
            pages.push(`${this.baseUrl}/media/manga/${mangaId}/chapters/${storage}/${group}/${image}`)
        }

        return createChapterDetails({
            id: chapterId,
            longStrip: false,
            mangaId: mangaId,
            pages: pages
        })

    }


    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {

        const request = createRequestObject({
            url: `${this.baseUrl}/api/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const updatedManga: string[] = []
        for (const item in data) {
            const manga = data[item]
            const mangaDate = new Date(manga.last_updated * 1000)
            const id = manga.slug

            if (mangaDate > time) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            }
        }

        if (updatedManga.length > 0) {
            mangaUpdatesFoundCallback(createMangaUpdates({
                ids: updatedManga
            }))

        }

    }


    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const sections = [
            createHomeSection({ id: 'featured', title: 'Featured Items', type: HomeSectionType.singleRowLarge, view_more: true }),
        ]

        const mangaArray: MangaTile[] = []

        for (const item in data) {
            const manga = data[item]
            const id = manga.slug

            mangaArray.push(createMangaTile({
                id: id,
                image: manga.cover ? this.baseUrl + manga.cover : this.fallbackImage,
                title: createIconText({ text: item })
            }))
        }

        for (const section of sections) {
            section.items = mangaArray.slice(0, 10)
            sectionCallback(section)
        }

    }

    override async getViewMoreItems(): Promise<PagedResults> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const mangaArray: MangaTile[] = []

        for (const item in data) {
            const manga = data[item]
            const id = manga.slug

            mangaArray.push(createMangaTile({
                id: id,
                image: manga.cover ? this.baseUrl + manga.cover : this.fallbackImage,
                title: createIconText({ text: item })
            }))
        }
        return createPagedResults({
            results: mangaArray
        })
    }

    async getSearchResults(query: SearchRequest): Promise<PagedResults> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/get_all_series`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data

        const searchQuery = query.title ? query.title.toLowerCase() : ''

        const searchFiltered = Object.keys(data).filter((e) => e.toLowerCase().includes(searchQuery))

        const results: MangaTile[] = []

        for (const item of searchFiltered) {
            const manga = data[item]
            manga
            results.push(createMangaTile({
                id: manga.slug,
                image: manga.cover ? this.baseUrl + manga.cover : this.fallbackImage,
                title: createIconText({ text: item })
            }))
        }
        return createPagedResults({ results: results })
    }

    protected decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str)
    }
}
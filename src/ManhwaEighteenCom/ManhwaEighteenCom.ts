import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType,
    PagedResults,
    MangaStatus,
    HomeSection,
    SearchRequest,
    Manga,
    Chapter,
    ChapterDetails,
    MangaUpdates,
    TagSection
} from 'paperback-extensions-common'
import {
    FMReader
} from '../FMReader'

import { ManhwaEighteenComParser } from './ManhwaEighteenComParser'
const ManhwaEighteenCom_DOMAIN = 'https://manhwa18.com'

export const ManhwaEighteenComInfo: SourceInfo = {
    version: '3.0.0',
    name: 'Manhwa18.com',
    description: 'Extension that pulls manga from Manhwa18.com',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: ManhwaEighteenCom_DOMAIN,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: 'English',
            type: TagType.GREY
        },
        {
            text: "18+",
            type: TagType.YELLOW
        },
        {
            text: "Notifications",
            type: TagType.RED
        },
    ]
}




export class ManhwaEighteenCom extends FMReader {
    baseUrl: string = ManhwaEighteenCom_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override readonly parser: ManhwaEighteenComParser = new ManhwaEighteenComParser()
    override requestPath: string = 'tim-kiem'
    override popularSort: string = 'sort=top'
    override chapterTimeSelector: string = ".chapter-time"
    override adult: boolean = true
    override chapterUrlSelector = ''
    override chapterDetailsImageSelector: string = '#chapter-content > img'
    override sourceTraversalPathName = 'manga'

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId, this)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.sourceTraversalPathName}/${chapterId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId, this)
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        let request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&page=1&${this.popularSort}&sort_type=DESC`,
            method: 'GET',
        })
        let response = await this.requestManager.schedule(request, 2)
        
        const popular = this.cheerio.load(response.data)

        request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&page=1&sort=update&sort_type=DESC`,
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
                param = `/${this.requestPath}?listType=pagination&page=${page}&sort=update&sort_type=DESC`
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

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?q=${query.title ? query.title : ''}&page=${page}${query?.includedTags?.length !== 0 ? `&accept_genres=${query?.includedTags?.map((x: any) => x.id)}`: ''}`,
            method: 'GET',
        })
    
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
    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page: number = 1;
        const request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?listType=pagination&page=${page}&sort=update&sort_type=DESC`,
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
    override parseStatus(str: string): MangaStatus {
        let status = MangaStatus.UNKNOWN

        switch (str.toLowerCase()) {
            case 'ongoing':
            case 'on going':
            case 'updating':
                status = MangaStatus.ONGOING
                break
            case 'completed':
            case 'complete':
            case 'incomplete':
                status = MangaStatus.COMPLETED
                break
        }
        return status
    }
}


import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType,
    MangaStatus,
    TagSection,
    SearchRequest,
    PagedResults,
    ChapterDetails,
    Chapter,
    Manga
} from 'paperback-extensions-common'
import {
    FMReader
} from '../FMReader'
import {KSGroupScansParser} from './KSGroupScansPraser'


const KSGroupScans_DOMAIN = 'https://ksgroupscans.com'

export const KSGroupScansInfo: SourceInfo = {
    version: '3.0.0',
    name: 'KSGroupScans',
    description: 'Extension that pulls manga from Manhwa18.net',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: KSGroupScans_DOMAIN,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: 'English',
            type: TagType.GREY
        },
    ]
}


export class KSGroupScans extends FMReader {
    baseUrl: string = KSGroupScans_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override requestPath: string = 'manga-list.html'
    override readonly parser: KSGroupScansParser = new KSGroupScansParser()
    override adult: boolean = true
    override chapterUrlSelector = ''
    override userAgent = ''
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
    override async getSearchTags(): Promise<TagSection[]> {
        const options = createRequestObject({
            url: `${this.baseUrl}/manga-list.html?name=`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status)
        let $ = this.cheerio.load(response.data);
        return [createTagSection({
            id: "1",
            label: "Genres",
            tags: this.parser.parseTags($)
        })];
    }
    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
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
            url: `${this.baseUrl}/${query?.includedTags?.map((x: any) => x.id)[0]}`,
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
   override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}${mangaId}/`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId, this)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}${mangaId}/`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}${chapterId}/`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId, this)
    }
}
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
    TagSection
} from 'paperback-extensions-common'
import {
    FMReader
} from '../FMReader'

import { EpikMangaParser } from './EpikMangaParser'
const EpikManga_DOMAIN = 'https://epikmanga.com'

export const EpikMangaInfo: SourceInfo = {
    version: '3.0.0',
    name: 'Epik Manga',
    description: 'Extension that pulls manga from Manhwa18.com',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: EpikManga_DOMAIN,
    language: LanguageCode.TURKISH,
    sourceTags: [
        {
            text: 'Turkish',
            type: TagType.GREY
        }
    ]
}




export class EpikManga extends FMReader {
    baseUrl: string = EpikManga_DOMAIN
    languageCode: LanguageCode = LanguageCode.TURKISH
    override readonly parser: EpikMangaParser = new EpikMangaParser()
    override requestPath: string = 'seri-listesi'
    override popularSort: string = 'sorting=views'
    override chapterTimeSelector: string = "time, .chapter-time, .publishedDate"
    override adult: boolean = false
    override sourceTraversalPathName = 'seri'
    override headerSelector = 'h4 a'

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
            url: `${this.baseUrl}/${this.requestPath}?${this.popularSort}&sorting-type=DESC&Sayfa=1`,
            method: 'GET',
        })
        let response = await this.requestManager.schedule(request, 2)
        
        const popular = this.cheerio.load(response.data)

        request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?sorting=lastUpdate&sorting-type=DESC&Sayfa=1`,
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
                param = `/${this.requestPath}?sorting=lastUpdate&sorting-type=DESC&Sayfa=${page}`
                break
            case '2':
                param = `/${this.requestPath}?${this.popularSort}&sorting-type=DESC&Sayfa=${page}`
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
        let request
        
        if (query.title) {
        request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?q=${query.title}&page=${page}`,
            method: 'GET',
        })
       } else {
        request = createRequestObject({
            url: `${this.baseUrl}/${this.requestPath}?genre=${query?.includedTags?.map((x: any) => x.id)[0]}&sorting-type=DESC`,
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

        switch (str.toLocaleLowerCase("tr-TR")) {
            case "devam ediyor":
                console.log(`ongoing series ${str}`)
                status = MangaStatus.ONGOING
                break
            case "tamamlandı":
                console.log(`completed series ${str}`)
                status = MangaStatus.COMPLETED
                break
        }
        return status
    }
    protected override parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        let number: number = Number((/\d*/.exec(date) ?? [])[0])
         if (date.includes('yıl') || date.includes('YIL') || date.includes('yil')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('ay') || date.includes('AY')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('hafta') || date.includes('HAFTA')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes('gün') || date.includes('GÜN')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('saat') || date.includes('SAAT')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('dakika') || date.includes('DAKIKA')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('İKİNCİ') || date.includes('SANİYE')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            time = new Date(date)
        }
        return time
    }
}


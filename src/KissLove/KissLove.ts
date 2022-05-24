import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType,
    MangaStatus,
    TagSection,
    ChapterDetails,
    PagedResults,
    SearchRequest
} from 'paperback-extensions-common'
import {
    FMReader
} from '../FMReader'
import {KissLoveParser} from './KissLovePraser'


const KissLove_DOMAIN = 'https://klmag.net'

export const KissLoveInfo: SourceInfo = {
    version: '3.0.0',
    name: 'KissLove',
    description: 'Extension that pulls manga from Manhwa18.net',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: KissLove_DOMAIN,
    language: LanguageCode.JAPANESE,
    sourceTags: [
        {
            text: 'Japanese',
            type: TagType.GREY
        },
    ]
}


export class KissLove extends FMReader {
    baseUrl: string = KissLove_DOMAIN
    languageCode: LanguageCode = LanguageCode.JAPANESE
    override requestPath: string = 'manga-list.html'
    override readonly parser: KissLoveParser  = new KissLoveParser()
    override adult: boolean = true
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
            url: `${this.baseUrl}/search`,
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
    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${chapterId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 3)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.Base64parseChapterDetails($, mangaId, chapterId, this)
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
            url: `${this.baseUrl}${query?.includedTags?.map((x: any) => x.id)[0]}`,
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
}
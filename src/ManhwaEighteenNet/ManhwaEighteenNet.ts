import {
    ContentRating,
    LanguageCode,
    SourceInfo,
    TagType,
    MangaStatus,
    TagSection,
    SearchRequest,
    PagedResults
} from 'paperback-extensions-common'
import {
    FMReader
} from '../FMReader'
import {ManhwaEighteenNetParser} from './ManhwaEighteenNetPraser'


const ManhwaEighteenNet_DOMAIN = 'https://manhwa18.net'

export const ManhwaEighteenNetInfo: SourceInfo = {
    version: '3.0.0',
    name: 'Manhwa18.net',
    description: 'Extension that pulls manga from Manhwa18.net',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: ManhwaEighteenNet_DOMAIN,
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


export class ManhwaEighteenNet extends FMReader {
    baseUrl: string = ManhwaEighteenNet_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
    override requestPath: string = 'manga-list.html'
    override readonly parser: ManhwaEighteenNetParser = new ManhwaEighteenNetParser()
    override adult: boolean = true
    override chapterUrlSelector = ''
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
}
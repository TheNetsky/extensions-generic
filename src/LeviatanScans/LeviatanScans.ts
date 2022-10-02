import {
    ContentRating,
    HomeSection,
    LanguageCode,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'
import {
    getExportVersion,
    Madara
} from '../Madara'

const DOMAIN = 'https://en.leviatanscans.com'

export const LeviatanScansInfo: SourceInfo = {
    version: getExportVersion('0.0.3'),
    name: 'LeviatanScans',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'GameFuzzy',
    authorWebsite: 'http://github.com/gamefuzzy',
    icon: 'icon.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        }
    ]
}

export class LeviatanScans extends Madara {

    baseUrl: string = DOMAIN

    override languageCode: LanguageCode = LanguageCode.ENGLISH

    override sourceTraversalPathName = ''

    override alternativeChapterAjaxEndpoint = true


    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const getTraversalPathName = await this.getTraversalPathName()

        this.sourceTraversalPathName = getTraversalPathName

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

    async getTraversalPathName():Promise<string> {
        const request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
        })

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const path = $('.c-sub-nav_wrap ul li:contains(\'Manga\') a').attr('href')?.replace(`${this.baseUrl}/`,'').replace(/\/+$/, '') ?? ''
        return path
    }
}

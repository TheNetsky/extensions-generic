/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Chapter,
    ChapterDetails,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    Tag,
    TagSection,
} from 'paperback-extensions-common'

import entities = require('entities')
import { getHQThumbnailSetting } from './MadaraSettings'

export class Parser {

    async parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Promise<Manga> {
        const numericId = this.parsePostId($)
        const title = this.decodeHTMLEntity($('div.post-title h1, div#manga-title h1').children().remove().end().text().trim())
        const author = this.decodeHTMLEntity($('div.author-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const artist = this.decodeHTMLEntity($('div.artist-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const summary = this.decodeHTMLEntity($('div.description-summary').first().text()).replace('Show more', '').trim()
        const image = encodeURI(await this.getImageSrc($('div.summary_image img').first(), source))
        const isOngoing = $('div.summary-content', $('div.post-content_item').last()).text().toLowerCase().trim() == 'ongoing'
        const genres: Tag[] = []

        // Grab genres and check for smut tag
        for (const obj of $('div.genres-content a').toArray()) {
            const label = $(obj).text()
            const id = $(obj).attr('href')?.split('/')[4] ?? label

            if (!label || !id) continue
            genres.push(createTag({ label: label, id: id }))
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: genres })]

        // If we cannot parse out the data-id for this title, we cannot complete subsequent requests
        if (!numericId) {
            throw new Error(`Could not parse out the data-id for ${mangaId} - This method might need overridden in the implementing source`)
        }

        return createManga({
            id: mangaId,
            titles: [title],
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            author: author,
            artist: artist,
            tags: tagSections,
            desc: summary,
            status: isOngoing ? MangaStatus.ONGOING : MangaStatus.COMPLETED
        })
    }

    parseChapterList($: CheerioSelector, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        let sortingIndex = 0

        // For each available chapter..
        for (const obj of $('li.wp-manga-chapter  ').toArray()) {
            const id = ($('a', obj).first().attr('href') || '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const chapName = $('a', obj).first().text().trim() ?? ''

            const chapNum = Number(decodeURIComponent(id).match(/\D*(\d*\-?\d*)\D*$/)?.pop()?.replace(/-/g, '.'))

            let mangaTime: Date
            const timeSelector = $('span.chapter-release-date > a, span.chapter-release-date > span.c-new-tag > a', obj).attr('title')
            if (typeof timeSelector !== 'undefined') {
                //Firstly check if there is a NEW tag, if so parse the time from this
                mangaTime = this.parseDate(timeSelector ?? '')
            } else {
                //Else get the date from the info box
                mangaTime = this.parseDate($('span.chapter-release-date > i', obj).text().trim())
            }

            //Check if the date is a valid date, else return the current date
            if (!mangaTime.getTime()) mangaTime = new Date()

            if (typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`)
            }

            chapters.push({
                id: id,
                mangaId: mangaId,
                langCode: source.languageCode ?? LanguageCode.UNKNOWN,
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                name: chapName ? this.decodeHTMLEntity(chapName) : undefined,
                time: mangaTime,
                // @ts-ignore
                sortingIndex
            })
            sortingIndex--
        }

        return chapters.map(chapter => {
            // @ts-ignore
            chapter.sortingIndex += chapters.length
            return createChapter(chapter)
        })
    }

    async parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string, selector: string): Promise<ChapterDetails> {
        const pages: string[] = []

        for (const obj of $(selector).toArray()) {
            const page = this.getImageSrc($(obj))
            if (!page) {
                throw new Error(`Could not parse page for ${mangaId}/${chapterId}`)
            }

            pages.push(encodeURI(await page))
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })
    }

    parseTags($: CheerioSelector, advancedSearch: boolean): TagSection[] {
        const genres: Tag[] = []
        if (advancedSearch) {
            for (const obj of $('.checkbox-group div label').toArray()) {
                const label = $(obj).text().trim()
                const id = $(obj).attr('for') ?? label
                genres.push(createTag({ label: label, id: id }))
            }
        } else {
            for (const obj of $('.menu-item-object-wp-manga-genre a', $('.second-menu')).toArray()) {
                const label = $(obj).text().trim()
                const id = $(obj).attr('href')?.split('/')[4] ?? label
                genres.push(createTag({ label: label, id: id }))
            }
        }
        return [createTagSection({ id: '0', label: 'genres', tags: genres })]
    }

    async parseSearchResults($: CheerioSelector, source: any): Promise<MangaTile[]> {
        const results: MangaTile[] = []
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ($('a', obj).attr('href') ?? '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const title = $('a', obj).attr('title') ?? ''
            const image = encodeURI(await this.getImageSrc($('img', obj), source))
            const subtitle = $('span.font-meta.chapter', obj).text().trim()

            if (!id || !title) {
                if (id.includes(source.baseUrl.replace(/\/$/, ''))) continue
                // Something went wrong with our parsing, return a detailed error
                console.log(`Failed to parse searchResult for ${source.baseUrl} using ${source.searchMangaSelector} as a loop selector`)
                continue
            }

            results.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) })
            }))
        }

        return results
    }

    async parseHomeSection($: CheerioStatic, source: any): Promise<MangaTile[]> {
        const items: MangaTile[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI(await this.getImageSrc($('img', obj), source) ?? '')
            const title = $('a', $('h3.h5', obj)).last().text()
            const id = $('a', $('h3.h5', obj)).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const subtitle = $('span.font-meta.chapter', obj).first().text().trim()

            if (!id || !title) {
                console.log(`Failed to parse homepage sections for ${source.baseUrl}/`)
                continue
            }

            items.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) })
            }))
        }
        return items
    }

    filterUpdatedManga($: CheerioSelector, time: Date, ids: string[], source: any): { updates: string[], loadNextPage: boolean } {
        let passedReferenceTimePrior = false
        let passedReferenceTimeCurrent = false
        const updatedManga: string[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const id = $('a', $('h3.h5', obj)).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '') ?? ''

            let mangaTime: Date
            const timeSelector = $('span.post-on.font-meta > a, span.post-on.font-meta > span > a', obj).attr('title')
            if (typeof timeSelector !== 'undefined') {
                //Firstly check if there is a NEW tag, if so parse the time from this
                mangaTime = this.parseDate(timeSelector ?? '')
            } else {
                //Else get the date from the span
                mangaTime = this.parseDate($('span.post-on.font-meta', obj).first().text().trim())
            }
            //Check if the date is valid, if it isn't we should skip it
            if (!mangaTime.getTime()) continue

            passedReferenceTimeCurrent = mangaTime <= time
            if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            } else break

            if (typeof id === 'undefined') {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/`)
            }
            passedReferenceTimePrior = passedReferenceTimeCurrent
        }
        if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
            return { updates: updatedManga, loadNextPage: true }
        } else {
            return { updates: updatedManga, loadNextPage: false }
        }
    }

    // UTILITY METHODS
    protected decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str)
    }

    async getImageSrc(imageObj: Cheerio | undefined, source?: any): Promise<string> {

        let image
        if ((typeof imageObj?.attr('data-src')) != 'undefined') {
            image = imageObj?.attr('data-src')
        }
        else if ((typeof imageObj?.attr('data-lazy-src')) != 'undefined') {
            image = imageObj?.attr('data-lazy-src')
        }
        else if ((typeof imageObj?.attr('srcset')) != 'undefined') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        }
        else if ((typeof imageObj?.attr('src')) != 'undefined') {
            image = imageObj?.attr('src')
        }
        else if ((typeof imageObj?.attr('data-cfsrc')) != 'undefined') {
            image = imageObj?.attr('data-cfsrc')
        } else {
            image = 'https://i.imgur.com/GYUxEX8.png' // Fallback image
        }

        if (source?.stateManager) {
            const HQthumb = await getHQThumbnailSetting(source.stateManager) as boolean

            if (HQthumb) {
                image = image?.replace('-110x150', '')
                    .replace('-175x238', '')
                    .replace('-193x278', '')
                    .replace('-350x476', '')
            }
        }
        return decodeURI(this.decodeHTMLEntity(image?.trim() ?? ''))
    }

    parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        const number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
            time = new Date(Date.now())
        } else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            time = new Date(date)
        }
        return time
    }

    parsePostId($: CheerioStatic): string { // Credit to the MadaraDex team :-D
        let postId: number

        // Step 1: Try to get postId from shortlink
        postId = Number($('link[rel="shortlink"]')?.attr('href')?.split('/?p=')[1])

        // Step 2: If no number has been found, try to parse from data-post
        if (isNaN(postId)) {
            postId = Number($('a.wp-manga-action-button').attr('data-post'))
        }

        // Step 3: If no number has been found, try to parse from manga script
        if (isNaN(postId)) {
            const page = $.root().html()
            const match = page?.match(/manga_id.*\D(\d+)/)
            if (match && match[1]) {
                postId = Number(match[1]?.trim())
            }
        }

        if (!postId || isNaN(postId)) {
            throw new Error('Unable to fetch numeric postId for this item!\nCheck if path is set correctly!')
        }

        return postId.toString()
    }

}
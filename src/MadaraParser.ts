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
    TagSection
} from 'paperback-extensions-common'

import entities = require('entities')

export class Parser {

    parseMangaDetails($: CheerioSelector, mangaId: string): Manga {
        const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1]
        const title = this.decodeHTMLEntity($('div.post-title h1').children().remove().end().text().trim())
        const author = this.decodeHTMLEntity($('div.author-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const artist = this.decodeHTMLEntity($('div.artist-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const summary = this.decodeHTMLEntity($('div.description-summary').first().text()).replace('Show more', '').trim()
        const image = encodeURI(this.getImageSrc($('div.summary_image img').first()))
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
                mangaTime = source.parseDate(timeSelector ?? '')
            } else {
                //Else get the date from the info box
                mangaTime = source.parseDate($('span.chapter-release-date > i', obj).text().trim())
            }

            //Check if the date is a valid date, else return the current date
            if (!mangaTime.getTime()) mangaTime = new Date()

            if (typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`)
            }

            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                langCode: source.languageCode ?? LanguageCode.UNKNOWN,
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                name: chapName ? this.decodeHTMLEntity(chapName) : undefined,
                time: mangaTime,
                // @ts-ignore
                sortingIndex
            }))
            sortingIndex--
        }

        return chapters
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string, selector: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $(selector).toArray()) {
            const page = this.getImageSrc($(obj))
            if (!page) {
                throw new Error(`Could not parse page for ${mangaId}/${chapterId}`)
            }

            pages.push(encodeURI(page))
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

    parseSearchResults($: CheerioSelector, source: any): MangaTile[] {
        const results: MangaTile[] = []
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ($('a', obj).attr('href') ?? '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const title = $('a', obj).attr('title') ?? ''
            const image = encodeURI(this.getImageSrc($('img', obj)))
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

    parseHomeSection($: CheerioStatic, source: any): MangaTile[] {
        const items: MangaTile[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI(this.getImageSrc($('img', obj)) ?? '')
            const title = $('a', $('h3.h5', obj)).text()
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
                mangaTime = source.parseDate(timeSelector ?? '')
            } else {
                //Else get the date from the span
                mangaTime = source.parseDate($('span.post-on.font-meta', obj).first().text().trim())
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
    getImageSrc(imageObj: Cheerio | undefined): string {
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
        return decodeURI(this.decodeHTMLEntity(image?.trim() ?? ''))
    }

    protected decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str)
    }
}
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Parser } from '../MadaraParser'
import {
    Chapter,
    LanguageCode,
    Manga,
    MangaStatus,
    Tag,
    TagSection,
} from 'paperback-extensions-common'

export class MangaOriginesParser extends Parser {
    override async parseMangaDetails($: CheerioSelector, mangaId: string, source: any): Promise<Manga> {
        const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1]
        const title = this.decodeHTMLEntity($('div.post-title h1, div#manga-title h1').children().remove().end().text().trim())
        const author = this.decodeHTMLEntity($('div.author-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const artist = this.decodeHTMLEntity($('div.artist-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const summary = this.decodeHTMLEntity($('div.manga-excerpt').first().text()).replace('Show more', '').trim()
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
    };

    override parseChapterList($: CheerioSelector, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        let sortingIndex = 0

        // For each available chapter..
        for (const obj of $('li.wp-manga-chapter  ').toArray()) {
            const urlParts = ($('a', obj).first().attr('href') || '').split('/');
            const id = mangaId + '/' + (urlParts[5] ?? '');
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


}

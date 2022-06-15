/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Chapter,
    ChapterDetails,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile
} from 'paperback-extensions-common'

import entities = require('entities')

export interface UpdatedManga {
    ids: string[];
    loadMore: boolean;
}

export class GenkanParser {


    parseMangaDetails = ($: CheerioStatic, mangaId: string, source: any): Manga => {
        const title = $('div#content h5').first().text() ?? ''

        const imageStyle = $('div.media.media-comic-card > a').css('background-image') ?? ''
        const imageStyleRegex = imageStyle?.match(/\((.+)\)/)

        let image
        if (imageStyleRegex && imageStyleRegex[1]) image = imageStyleRegex[1]
        if (image?.startsWith('/')) image = source.baseUrl + image

        const description = this.decodeHTMLEntity($('h6:contains(Description)').parent().parent().children().remove().end().text().trim())

        return createManga({
            id: mangaId,
            titles: [title],
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            status: MangaStatus.ONGOING,
            desc: description,
        })
    }

    parseChapters = ($: CheerioStatic, mangaId: string, source: any): Chapter[] => {
        const chapters: Chapter[] = []

        for (const volume of $('div.row.py-2').toArray()) {
            const getVolume = $('div.heading.py-2', volume).text().trim()

            const volNumberRegex = getVolume.match(/(\d+\.?\d?)+/)
            let volumeNumber = 0
            if (volNumberRegex && volNumberRegex[1]) volumeNumber = Number(volNumberRegex[1])

            const volChapters = $('div.list-item', volume).toArray()

            for (const chapter of volChapters) {
                const id = this.idCleaner($('a.item-author', chapter).attr('href') ?? '', source) ?? ''
                const chapNum = Number(id.split('/').pop())

                const title = $('a.item-author', chapter).text().trim() ?? ''
                const dateRaw = $('a.item-company', chapter).first().text()?.trim() ?? ''
                const date = this.convertTime(dateRaw)

                if (!id) continue

                chapters.push(createChapter({
                    id: id,
                    mangaId,
                    name: title,
                    langCode: LanguageCode.ENGLISH,
                    chapNum: isNaN(chapNum) ? 0 : chapNum,
                    volume: volumeNumber,
                    time: date,
                }))
            }


        }
        return chapters

    }

    parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string, source: any): ChapterDetails => {
        const pages: string[] = []

        const allImages = $('div#pages-container + script')[0]?.children[0]?.data?.substringAfterFirst('[').substringBeforeLast('];').replace(/["\\]/g, '').split(',') ?? []

        if (!allImages || allImages.length == 0) {
            throw new Error(`Unable to parse image script for mangaId:${mangaId} chaperId:${chapterId}`)
        }

        for (const p in allImages) {
            let page = encodeURI(allImages[p])
            page = page.startsWith('http') ? page : source.baseUrl + page

            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`)
            }
            pages.push(page)
        }

        const chapterDetails = createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })

        return chapterDetails
    }


    parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[], source: any): UpdatedManga => {
        let loadMore = true
        const updatedManga: string[] = []

        for (const obj of $('div.list-item').toArray()) {
            const id = this.idCleaner($('a.list-title', $(obj)).attr('href') ?? '', source) ?? ''
            const mangaTime: Date = this.convertTime($('.text-muted.text-sm', obj).text() ?? '')

            if (!id || !mangaTime) continue

            if (mangaTime > time) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            } else {
                loadMore = false
            }
        }

        return {
            ids: updatedManga,
            loadMore,
        }
    }

    parseMangaList = ($: CheerioStatic, source: any, isLatest: boolean): MangaTile[] => {
        const results: MangaTile[] = []
        const collectedIds: string[] = []

        for (const manga of $('div.list-item').toArray()) {
            const title = $('a.list-title', manga).first().text().trim() ?? ''
            const id = this.idCleaner($('a.list-title', manga).first().attr('href') ?? '', source) ?? ''

            const imageStyle = $('div.media.media-comic-card > a' , manga).css('background-image') ?? ''
            const imageStyleRegex = imageStyle?.match(/\((.+)\)/)

            let image
            if (imageStyleRegex && imageStyleRegex[1]) image = imageStyleRegex[1]
            if (image?.startsWith('/')) image = source.baseUrl + image

            const subtitle = isLatest ? $('.media .media-overlay span', manga).text().trim() ?? '' : ''

            if (!id || !title || collectedIds.includes(id)) continue

            results.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) })
            }))
            collectedIds.push(id)

        }
        return results
    }

    NextPage = ($: CheerioStatic): boolean => {
        const nextPage = $('[rel=next]')
        if (nextPage.contents().length !== 0) {
            return true
        } else {
            return false
        }
    }

    decodeHTMLEntity = (str: string): string => {
        return entities.decodeHTML(str)
    }

    idCleaner = (str: string, source: any): string => {
        const base = source.baseUrl.split('://').pop()
        str = str.replace(/(https:\/\/|http:\/\/)/, '')
        str = str.replace(/\/$/, '')
        str = str.replace(`${base}/`, '')
        str = str.replace(`${source.mangaUrlDirectory}/`, '')
        str = str.replace(`${source.serieslDirectory}/`, '')
        return str
    }

    countryOfOriginToSeriesType = (country: string): string => {
        let info = ''
        switch (country.toLowerCase()) {
            case 'south korea':
                info = 'Manhwa'
                break
            case 'japan':
                info = 'Manga'
                break
            case 'china':
                info = 'Manhwa'
                break
        }
        return info
    }

    convertTime = (timeAgo: string): Date => {
        let time: Date
        let trimmed = Number((/\d*/.exec(timeAgo.trim()) ?? [])[0])
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000)
        } else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000)
        } else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000)
        } else if (timeAgo.includes('weeks') || timeAgo.includes('week')) {
            time = new Date(Date.now() - trimmed * 604800000)
        } else if (timeAgo.includes('months') || timeAgo.includes('month')) {
            time = new Date(Date.now() - trimmed * 2548800000)
        } else if (timeAgo.includes('years') || timeAgo.includes('year')) {
            time = new Date(Date.now() - trimmed * 31556952000)
        } else {
            time = new Date(timeAgo)
        }

        return time
    }
}

declare global {
    interface String {
        /**
         * Calls the specified function block with `this` value as its argument and returns its result
         * @param block - The function to be executed with `this` as argument
         * @returns `block`'s result
         */
        let<R>(this: string | null | undefined, block: (it: string) => R): R;
        substringBeforeLast(character: any): any
        substringAfterFirst(substring: any): any
    }
}

String.prototype.substringBeforeLast = function (character) {
    const lastIndexOfCharacter = this.lastIndexOf(character)
    return this.substring(0, lastIndexOfCharacter)
}

String.prototype.substringAfterFirst = function (substring) {
    const startingIndexOfSubstring = this.indexOf(substring)
    const endIndexOfSubstring = startingIndexOfSubstring + substring.length - 1
    return this.substring(endIndexOfSubstring + 1, this.length)
}
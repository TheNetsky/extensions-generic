/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    Chapter,
    ChapterDetails,
    Tag,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection
} from 'paperback-extensions-common'

import entities = require('entities')

export interface UpdatedManga {
    ids: string[],
    loadMore: boolean;
}

export const parseMangaDetails = ($: CheerioStatic, mangaId: string, source: any): Manga => {
    const panel = $(source.mangaDetailsMainSelector)

    const titles = []
    titles.push(decodeHTMLEntity($('h1, h2', panel).first().text())) //Main English title

    for (const alttitle of $('.story-alternative, tr:has(.info-alternative) h2', panel).text().replace('Alternative :', '')?.split(/,|;|\//)) {
        if (alttitle == '') continue
        titles.push(decodeHTMLEntity(alttitle.trim()))
    }

    const author = $('li:contains(Author) a, td:contains(Author) + td a', panel).toArray().map(x => $(x).text()).join(', ')
    const image = $(source.thumbnailSelector, panel).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
    const description = decodeHTMLEntity($(source.descriptionSelector).first().children().remove().end().text().trim())
    let hentai = false

    const arrayTags: Tag[] = []
    for (const tagCheerio of $('li:contains(Genre) a, td:contains(Genre) + td a', panel).toArray()) {
        const id = source.parseTagUrl($(tagCheerio).attr('href'))
        console.log(id)
        const label = $(tagCheerio).text()
        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus = $('li:contains(Status), td:contains(Status) + td').text().trim() ?? 'ONGOING'
    let status = MangaStatus.ONGOING
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = MangaStatus.ONGOING
            break
        case 'COMPLETED':
            status = MangaStatus.COMPLETED
            break
        default:
            status = MangaStatus.ONGOING
            break
    }

    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        rating: 0,
        status: status,
        author: author,
        tags: tagSections,
        desc: description,
        hentai: hentai
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string, source: any): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $(source.chapterListSelector).toArray()) {
        const title = decodeHTMLEntity($('a', chapter).text().trim())
        const id = $('a', chapter).attr('href') ?? ''
        const date = source.convertTime($('span', chapter).last().text()?.trim() ?? '')
        const chapRegex = title.match(/(?:[Cc]hapter)\s(\d+\.?\d?)/)
        let chapterNumber = 0
        if (chapRegex && chapRegex[1]) chapterNumber = Number(chapRegex[1].replace(/\\/g, '.'))
        if (!id) continue
        chapters.push(createChapter({
            id: id,
            mangaId,
            name: title,
            langCode: LanguageCode.ENGLISH,
            chapNum: chapterNumber,
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const p of $('img', 'div.container-chapter-reader').toArray()) {
        let image = $(p).attr('src') ?? ''
        if (!image) image = $(p).attr('data-src') ?? ''
        if (!image) throw new Error(`Unable to parse image(s) for chapterID: ${chapterId}`)
        pages.push(image)
    }
    const chapterDetails = createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: false
    })

    return chapterDetails
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[], source: any): UpdatedManga => {
    const updatedManga: string[] = []
    let loadMore = true

    for (const manga of $(source.mangaListSelector).toArray()) {
        const id = $('a', manga).first().attr('href')
        const mangaDate = source.convertTime($(source.mangaListTimeSelector, manga).text().replace('Updated :', '').replace('-', '').trim() ?? '')
        if (!id) continue
        if (mangaDate > time) {
            if (ids.includes(id)) {
                updatedManga.push(id)
            }
        } else {
            loadMore = false
        }
    }
    return {
        ids: updatedManga,
        loadMore
    }
}

export const parseMangaList = ($: CheerioStatic, source: any): MangaTile[] => {
    const results: MangaTile[] = []
    for (const manga of $(source.mangaListSelector).toArray()) {
        const title = $('a', manga).first().attr('title')
        const id = $('a', manga).first().attr('href')
        const image = $('img', manga).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        const subtitle = $(source.mangaListSubtitleSelector, manga).last().text().trim()
        if (!id || !title) continue
        results.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }))
    }
    return results
}

export const parseTags = ($: CheerioStatic): TagSection[] => {
    const arrayTags: Tag[] = []
    for (const tag of $('div.advanced-search-tool-genres-list span.advanced-search-tool-genres-item-choose').toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('data-i')
        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
    return tagSections
}

export const isLastPage = ($: CheerioStatic): boolean => {
    const current = $('.page-select, .page_select').text()
    let total = $('.page-last, .page_last').text()

    if (current) {
        total = (/(\d+)/g.exec(total) ?? [''])[0]!
        return (+total) === (+current)
    }
    return true
}

export const decodeHTMLEntity = (str: string): string => {
    return entities.decodeHTML(str)
}

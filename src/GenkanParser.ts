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

export const parseMangaDetails = ($: CheerioStatic, mangaId: string, source: any): Manga => {

    const title = $('div#content h5').first().text() ?? ''
    const image = styleToUrl($('div.media a').first(),source) ?? 'https://i.imgur.com/GYUxEX8.png'
    const description = decodeHTMLEntity($('div.col-lg-9').first().text().trim()).substringAfterFirst('Description ').substringBeforeLast(' Volume')
    let hentai = false

    const arrayTags: Tag[] = []
    const country = $(source.countryOfOriginSelector).first().text().trim()
    const ishentai = $(source.isHentaiSelector).first().text().trim()
    country !== '' ? arrayTags.push({id: 'country', label: countryOfOriginToSeriesType(country)}) : null
    if (ishentai.toLocaleLowerCase().includes('yes')) hentai = true
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    return createManga({
        id: mangaId,
        titles: [title],
        image: image,
        rating: 0,
        status: MangaStatus.ONGOING,
        tags: tagSections,
        desc: description,
        hentai: hentai
    })
}
export const countryOfOriginToSeriesType = (country: string): string =>{
    let info = ''
    switch (country.toLowerCase()){
        case 'south korea':
            info = 'Manhwa'
            break
        case 'japan':
            info = 'Manga'
            break
        case 'china':
            info = 'Manhwa'
            break
        default:
            info = ''
            break
    }
    return info
}
export const parseChapters = ($: CheerioStatic, mangaId: string, source: any): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('div.col-lg-9 div.flex').toArray()) {
        const urlElement = $('a.item-author',chapter)
        const chapNu = urlElement.attr('href')?.split('/') ?? ''
        const chapNum = chapNu[chapNu.length - 1]
        const id = idCleaner(urlElement.attr('href') ?? '',source) ?? ''
        const dateinfo = $('a.item-company', chapter).first().text()?.trim() ?? ''
        let date
        let title
        if (urlElement.text().includes(`Chapter ${chapNum}`)) {
            title = urlElement.text().trim()
        } else {
            title = `Ch. ${chapNum}: ${urlElement.text().trim()}`
        }
        if(dateinfo.toLowerCase().includes('ago')){
            date = source.convertTime(dateinfo)
        } else {
            date = new Date(dateinfo)
        }
        if (!id) continue
        chapters.push(createChapter({
            id: id,
            mangaId,
            name: title,
            langCode: LanguageCode.ENGLISH,
            chapNum: Number(chapNum),
            time: date,
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string,source: any): ChapterDetails => {
    const pages: string[] = []

    const allImages = $('div#pages-container + script')[0]?.children[0]?.data?.substringAfterFirst('[').substringBeforeLast('];').replace(/["\\]/g, '').split(',') ?? []
    for (const p in allImages) {
        let page = encodeURI(allImages[p])
        page = page.startsWith('http') ? page : source.baseUrl + page
        if (!page) {
            throw(`Could not parse page for ${chapterId}`)
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

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[], source: any) => {
    let passedReferenceTime = false
    const updatedManga: string[] = []

    for (const obj of $('div.list-item').toArray()) {
        const id = idCleaner($('a.list-title', $(obj)).attr('href') ?? '',source) ?? ''
        const mangaTime: Date = source.convertTime($('.text-muted.text-sm', obj).text() ?? '')
        passedReferenceTime = mangaTime <= time
        if (!passedReferenceTime) {
            if (ids.includes(id)) {
                updatedManga.push(id)
            }
        } else break

        if (typeof id === 'undefined') {
            throw(`Failed to parse homepage sections for ${source.baseUrl}/${source.homePage}/`)
        }
    }
    if (!passedReferenceTime) {
        return {updates: updatedManga, loadNextPage: true}
    } else {
        return {updates: updatedManga, loadNextPage: false}
    }
}

export const parseMangaList = ($: CheerioStatic, source: any, isLatest: boolean,collectedIds?: string[]): MangaTile[] => {
    const results: MangaTile[] = []
    if(typeof collectedIds === 'undefined') {
        collectedIds = []
    }
    for (const manga of $('div.list-item').toArray()) {
        const info = $('a.list-title',manga).first()
        const title = $(info).text().trim() ?? ''
        const id = idCleaner($(info).attr('href') ?? '',source) ?? ''
        const image = styleToUrl($('a.media-content', manga).first(),source) ?? 'https://i.imgur.com/GYUxEX8.png'
        const subTitle = $('.media .media-overlay span',manga).text().trim() ?? ''
        if (!id || !title) {
            throw(`Failed to parse homepage sections for ${source.baseUrl}/`)
        }
        if (!collectedIds.includes(id)) {
            results.push(createMangaTile({
                id: id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: isLatest ? decodeHTMLEntity(subTitle) : ''})
            }))
            collectedIds.push(id)
        }
    }
    return results
}
export const NextPage = ($: CheerioStatic): boolean => {
    const nextPage = $('[rel=next]')
    if (nextPage.contents().length !== 0) {
        return true
    } else {
        return false
    }
}

export const decodeHTMLEntity = (str: string): string => {
    return str.replace(/&#(\d+);/g, (_match, dec) => {
        return String.fromCharCode(dec)
    })
}
export const styleToUrl = (Element:Cheerio,source: any): any =>{
    return Element.attr('style')?.substringAfterFirst('(').substringBeforeLast(')').let((it: any)=>{
        if(it.startsWith('http')){
            return it
        } else {
            return source.baseUrl + it
        }
    })
}
export const idCleaner = (str: string, source: any): string => {
    const base = source.baseUrl.split('://').pop()
    str = str.replace(/(https:\/\/|http:\/\/)/, '')
    str = str.replace(/\/$/, '')
    str = str.replace(`${base}/`, '')
    str = str.replace(`${source.mangaUrlDirectory}/`, '')
    str = str.replace(`${source.SerieslDirectory}/`, '')
    return str
}
export {}

declare global {
    interface String {
        /**
         * Calls the specified function block with `this` value as its argument and returns its result
         * @param block - The function to be executed with `this` as argument
         * @returns `block`'s result
         */
        let<R>(this: string | null | undefined, block: (it: string) => R): R
        substringBeforeLast(character:any): any
        substringAfterFirst(substring:any): any
    }
}
String.prototype.let = function(this, block) {
    return block(this!.valueOf())
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
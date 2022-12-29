import {
    Chapter,
    ChapterDetails,
    HomeSection,
    Manga,
    MangaTile,
    Tag,
    TagSection,
    MangaStatus,
    LanguageCode,
    HomeSectionType
} from 'paperback-extensions-common'

import entities = require('entities')


export class Parser {

    parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Manga {
        const titles: string[] = []
        titles.push(this.decodeHTMLEntity($('img.lazy.entered.loaded, div.cover > img').attr('alt')?.trim() ?? ''))

        const image = this.getImageSrc($('img.lazy, div.cover > img').first())

        const artist = $('a', $('span:contains(Artist)').parent()).toArray().map(x => $(x).text().trim()).join(', ') ?? 'Unknown'

        const arrayTags: Tag[] = []

        for (const tag of $('a', $('span:contains(Tags)').parent()).toArray()) {
            const count = $(tag).children().remove().text().trim()
            let label = $(tag).text().replace(count, '').trim()
            if (isNaN(Number(count))) label = count
            const id = encodeURI($(tag).attr('href')?.replace(/\/$/, '').split('/').pop() ?? '')

            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

        const description = `Tags: ${arrayTags.map(x => x.label).join(', ')}`

        return createManga({
            id: mangaId,
            titles: titles,
            image: image ? image : source.fallbackImage,
            status: MangaStatus.COMPLETED,
            author: artist,
            artist: artist,
            tags: tagSections,
            desc: description,
        })
    }

    parseChapters($: CheerioStatic, mangaId: string): Chapter[] {
        const chapters: Chapter[] = []

        const languageTag = $('a', $('span:contains(Language)').parent()).first().text().trim().toUpperCase()
        let langCode = LanguageCode.ENGLISH

        if (languageTag.includes('JAPANESE')) {
            langCode = LanguageCode.JAPANESE
        } else if (languageTag.includes('RUSSIAN')) {
            langCode = LanguageCode.RUSSIAN
        } else if (languageTag.includes('KOREAN')) {
            langCode = LanguageCode.KOREAN
        }

        chapters.push(createChapter({
            id: mangaId,
            mangaId: mangaId,
            name: 'Chapter 1',
            langCode: langCode,
            chapNum: 1,
            time: new Date(),
        }))

        return chapters
    }

    async parseChapterDetails($: CheerioStatic, mangaId: string, chapterId: string, source: any): Promise<ChapterDetails> {
        const pages: string[] = []

        const pageCount = Number($('#load_pages').attr('value'))
        const imgDir = $('#load_dir').attr('value')
        const imgId = $('#load_id').attr('value')

        if (!pageCount || isNaN(pageCount)) {
            throw new Error(`Unable to parse pageCount (found: ${pageCount}) for mangaId:${mangaId}`)
        }
        if (!imgDir) {
            throw new Error(`Unable to parse imgDir (found: ${imgDir}) for mangaId:${mangaId}`)
        }
        if (!imgId) {
            throw new Error(`Unable to parse imgId (found: ${imgId}) for mangaId:${mangaId}`)
        }

        const domain = this.getImageSrc($('img.lazy, div.cover > img').first())
        const subdomainRegex = domain.match(/\/\/([^.]+)/)

        let subdomain = null
        if (subdomainRegex && subdomainRegex[1]) subdomain = subdomainRegex[1]

        const domainSplit = source.baseUrl.split('//')

        for (let i = 1; i < pageCount; i++) {
            pages.push(`${domainSplit[0]}//${subdomain}.${domainSplit[1]}/${imgDir}/${imgId}/${i}.jpg`)
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }

    parseTags($: CheerioStatic, source: any): TagSection[] {
        const arrayTags: Tag[] = []

        for (const tag of $('div.col.col', source.tagBoxSelector).toArray()) {
            const label = $('h3', tag).text().trim()
            const id = encodeURI($('a', tag).attr('href')?.replace(/\/$/, '').split('/').pop() ?? '')
            if (!id || !label) continue

            arrayTags.push({ id: id, label: label })

        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

        return tagSections
    }

    parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void, source: any): void => {
        const homepageSection = createHomeSection({ id: 'homepage', title: 'Homepage', view_more: true, type: HomeSectionType.singleRowLarge })

        const items = this.parseDirectory($, source)
        homepageSection.items = items

        sectionCallback(homepageSection)
    }

    parseDirectory = ($: CheerioStatic, source: any): MangaTile[] => {
        const manga: MangaTile[] = []
        const collectedIds: string[] = []

        for (const obj of $('div.thumb', source.directoryGallerySelector).toArray()) {

            const image: string = this.getImageSrc($('img', $('div.inner_thumb', obj)).first() ?? '')
            const title: string = $('h2, div.caption', obj).first().text().trim() ?? ''
            const subtitle: string = $(source.directorySubtitleSelector, obj).text().trim() ?? ''

            const id = $('h2 > a, div.caption > a', obj).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? ''

            if (!id || !title) continue

            if (!collectedIds.includes(id)) {
                manga.push(createMangaTile({
                    id,
                    image: image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) })
                }))
                collectedIds.push(id)
            }
        }

        return manga
    }

    isLastPage = ($: CheerioStatic): boolean => {
        let isLast = false

        const hasEnded = $('li.page-item', 'ul.pagination').last().attr('class')
        if (hasEnded === 'page-item disabled') isLast = true
        return isLast
    }

    getImageSrc(imageObj: Cheerio | undefined): string {
        let image
        if (typeof imageObj?.attr('data-original') != 'undefined') {
            image = imageObj?.attr('data-original')
        }
        if (typeof imageObj?.attr('data-cfsrc') != 'undefined') {
            image = imageObj?.attr('data-cfsrc')
        }
        else if (typeof imageObj?.attr('data-src') != 'undefined') {
            image = imageObj?.attr('data-src')
        }
        else if (typeof imageObj?.attr('data-bg') != 'undefined') {
            image = imageObj?.attr('data-bg')
        }
        else if (typeof imageObj?.attr('data-srcset') != 'undefined') {
            image = imageObj?.attr('data-srcset')
        }
        else if (typeof imageObj?.attr('data-lazy-src') != 'undefined') {
            image = imageObj?.attr('data-lazy-src')
        }
        else if (typeof imageObj?.attr('data-aload') != 'undefined') {
            image = imageObj?.attr('data-aload')
        }
        else if (typeof imageObj?.attr('srcset') != 'undefined') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        }
        else {
            image = imageObj?.attr('src')
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity(image?.trim() ?? '')))
    }

    decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str)
    }

}

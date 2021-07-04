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

export class Parser {

    parseMangaDetails($: CheerioSelector, mangaId: string): Manga {
        const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1]
        const title = this.decodeHTMLEntity($('div.post-title h1').children().remove().end().text().trim())
        const author = this.decodeHTMLEntity($('div.author-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const artist = this.decodeHTMLEntity($('div.artist-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown')
        const summary = this.decodeHTMLEntity($('div.description-summary').first().text()).replace('Show more', '').trim()
        const image = encodeURI(this.getImageSrc($('div.summary_image img').first()))
        const rating = $('span.total_votes').text().replace('Your Rating', '')
        const isOngoing = $('div.summary-content', $('div.post-content_item').last()).text().toLowerCase().trim() == 'ongoing'
        const genres: Tag[] = []
        let hentai = $('.manga-title-badges.adult').length > 0

        // Grab genres and check for smut tag
        for (const obj of $('div.genres-content a').toArray()) {
            const label = $(obj).text()
            const id = $(obj).attr('href')?.split('/')[4] ?? label
            if (label.toLowerCase().includes('smut')) hentai = true
            genres.push(createTag({label: label, id: id}))
        }
        const tagSections: TagSection[] = [createTagSection({id: '0', label: 'genres', tags: genres})]

        // If we cannot parse out the data-id for this title, we cannot complete subsequent requests
        if (!numericId) {
            throw new Error(`Could not parse out the data-id for ${mangaId} - This method might need overridden in the implementing source`)
        }

        // If we do not have a valid image, something is wrong with the generic parsing logic. A source should always remedy this with
        // a custom implementation.
        if(!image) {
            throw new Error(`Could not parse out a valid image while parsing manga details for manga: ${mangaId}`)
        }

        return createManga({
            id: mangaId,
            titles: [title],
            image: image,
            author: author,
            artist: artist,
            tags: tagSections,
            desc: summary,
            status: isOngoing ? MangaStatus.ONGOING : MangaStatus.COMPLETED,
            rating: Number(rating),
            hentai: hentai
        })
    }

    parseChapterList($: CheerioSelector, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []

        // Capture the manga title, as this differs from the ID which this function is fed
        const realTitle = $('a', $('li.wp-manga-chapter  ').first()).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').toLowerCase().replace(/\/chapter.*/, '')

        if (!realTitle) {
            throw new Error(`Failed to parse the human-readable title for ${mangaId}`)
        }

        // For each available chapter..
        for (const obj of $('li.wp-manga-chapter  ').toArray()) {
            const id = ($('a', $(obj)).first().attr('href') || '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const chapNum = Number(id.match(/\D*(\d*\.?\d*)$/)?.pop())
            const chapName = $('a', $(obj)).first().text()

            let releaseDate: string
            if ($('a.c-new-tag', obj).length) {
                releaseDate = $('a.c-new-tag', obj).attr('title') ?? ''
            } else {
                releaseDate = $('i', obj).text().trim()
            }

            if (typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`)
            }
            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                langCode: source.languageCode ?? LanguageCode.UNKNOWN,
                chapNum: Number.isNaN(chapNum) ? 0 : chapNum,
                name: Number.isNaN(chapNum) ? chapName : undefined,
                time: source.convertTime(releaseDate)
            }))
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

            pages.push(page)
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
        if(advancedSearch) {
            for (const obj of $('.checkbox-group div label').toArray()) {
                const label = $(obj).text().trim()
                const id = $(obj).attr('for') ?? label
                genres.push(createTag({label: label, id: id}))
            }
        }
        else {
            for (const obj of $('.menu-item-object-wp-manga-genre a', $('.second-menu')).toArray()) {
                const label = $(obj).text().trim()
                const id = $(obj).attr('href')?.split('/')[4] ?? label
                genres.push(createTag({label: label, id: id}))
            }
        }
        return [createTagSection({id: '0', label: 'genres', tags: genres})]
    }

    parseSearchResults($: CheerioSelector, source: any): MangaTile[] {
        const results: MangaTile[] = []
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ($('a', $(obj)).attr('href') ?? '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const title = createIconText({text: this.decodeHTMLEntity($('a', $(obj)).attr('title') ?? '')})
            const image = encodeURI(this.getImageSrc($('img', $(obj))))
            const subtitle = createIconText({text: $('span.font-meta.chapter', obj).text().trim() })

            if (!id || !image || !title.text) {
                if(id.includes(source.baseUrl.replace(/\/$/, ''))) continue
                // Something went wrong with our parsing, return a detailed error
                throw new Error(`Failed to parse searchResult for ${source.baseUrl} using ${source.searchMangaSelector} as a loop selector`)
            }

            results.push(createMangaTile({
                id: id,
                title: title,
                image: image,
                subtitleText: subtitle
            }))
        }
        return results
    }

    parseHomeSection($: CheerioStatic, source: any): MangaTile[] {
        const items: MangaTile[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI(this.getImageSrc($('img', $(obj))) ?? '')
            const title = this.decodeHTMLEntity($('a', $('h3.h5', $(obj))).text())
            const id = $('a', $('h3.h5', $(obj))).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const subtitle = $('span.font-meta.chapter', obj).first().text().trim()

            if (!id || !title || !image) {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/`)
            }

            items.push(createMangaTile({
                id: id,
                title: createIconText({text: title}),
                image: image,
                subtitleText: createIconText({text: subtitle })
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
            if ($('a.c-new-tag', obj).length) {
                mangaTime = source.convertTime($('a.c-new-tag', obj).attr('title') ?? '')
            } else {
                mangaTime = source.convertTime($('i', obj).text().trim())
            }

            passedReferenceTimeCurrent = mangaTime <= time
            if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            } else break

            if (typeof id === 'undefined') {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/${source.homePage}/`)
            }
            passedReferenceTimePrior = passedReferenceTimeCurrent
        }
        if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
            return {updates: updatedManga, loadNextPage: true}
        } else {
            return {updates: updatedManga, loadNextPage: false}
        }


    }

    // UTILITY METHODS

    getImageSrc(imageObj: Cheerio | undefined): string {
        let image
        if(typeof imageObj?.attr('data-src') != 'undefined') {
            image = imageObj?.attr('data-src')
        }
        else if (typeof imageObj?.attr('data-lazy-src') != 'undefined') {
            image = imageObj?.attr('data-lazy-src')
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
        return str.replace(/&#(\d+);/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }
}

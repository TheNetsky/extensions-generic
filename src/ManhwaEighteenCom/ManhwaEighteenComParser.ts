import {
    Chapter,
    Manga,
    TagSection,
    Tag,
} from 'paperback-extensions-common'
import { Parser } from '../FMReaderParser'

export class ManhwaEighteenComParser extends Parser {
    override parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Manga {
        const title = this.decodeHTMLEntity($('.series-name').first().text().replace(/manhwa/gi, '').replace(/engsub/gi, '').trim()) ?? ''
        const image = $("meta[property='og:image']").attr("content") ?? 'https://i.imgur.com/GYUxEX8.png'
        let desc = this.decodeHTMLEntity($('.summary-content').text().trim()) ?? ''
        let thumbnail = ''
        if(!image.startsWith('https:')){
            thumbnail = source.baseUrl + image
        } else {
            thumbnail = image
        }
        if (desc == '') desc = `No Decscription provided by the source(${source.baseUrl})`
        let author = $('.info-name:contains(Author:) + .info-value').text().trim().replace('Updating', '') ?? ''
        const status = source.parseStatus($('.info-name:contains(Status:) + .info-value').text().replace(/ /g, ''))
        const arrayTags: Tag[] = []
        for (const tag of $('.info-name:contains(Genre:) + .info-value > a').toArray()) {
            const label = $(tag).text().trim()
            const id = $(tag).attr('href')
            if (!label || !id) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [title],
            image: thumbnail,
            rating: 0,
            status,
            author,
            tags: tagSections,
            desc,
            hentai: source.adult,
        })
    }

    override parseChapters($: CheerioStatic, mangaId: string, source: any): Chapter[] {
        const langCode = source.languageCode
        const chapters: Chapter[] = []
        const title = $('.manga-info h1, .manga-info h3').text().trim()
        for (const chapter of $('.list-chapters > a').toArray()) {
            const info = $(chapter)
            const id = this.idCleaner(info.attr('href') ?? '',source) ?? ''
            const name = info.attr('title') ?? info.text().replace(title, '').trim() ?? ''
            const tama = this.substringAfterFirst(' - ',$(source.chapterTimeSelector, chapter).text().trim()).split('/')
            var day = Number(tama[0])
            var month = Number(tama[1])
            var year = Number(tama[2])
            const chapNum = this.chapterFromElement(name)
            if (!id) continue
            chapters.push(createChapter({
                id,
                mangaId,
                name,
                langCode,
                chapNum,
                time: new Date(`${year}/${month}/${day}`),
            }))

        }
        return chapters
    }

    substringAfterFirst(substring:any, string: any){
        var startingIndexOfSubstring = string.indexOf(substring);
        var endIndexOfSubstring = startingIndexOfSubstring + substring.length - 1;
        return string.substring(endIndexOfSubstring + 1, string.length);
    }

    override NextPage($: CheerioSelector) {
        var nextPage = $('.pagination_wrap .disabled').text();
        if (nextPage != "Bottom") {
            return true;
        } else {
            return false;
        }
    }
    override parseTags($: CheerioStatic) {
        const genres: Tag[] = [];
        for (const obj of $(".col-md-6 .form-group .row div").toArray()) {
            genres.push(createTag({
                id: $("label",obj).attr("data-genre-id") ?? '',
                label: $(obj).text().trim()
            }));
        }
        return genres;
    }
}
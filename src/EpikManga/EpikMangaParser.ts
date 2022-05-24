import {
    Chapter,
    Manga,
    TagSection,
    Tag,
} from 'paperback-extensions-common'
import { Parser } from '../FMReaderParser'

export class EpikMangaParser extends Parser {
    override parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Manga {
        const infoElement = $("div.col-md-9 div.row").first()
        let h1 = $("h1",infoElement)
        h1.find('span').remove()
        const title = this.decodeHTMLEntity(h1?.first()?.text()?.trim()) ?? ''
        const image = this.getImageSrc($("img.thumbnail",infoElement)) ?? 'https://i.imgur.com/GYUxEX8.png'
        let desc = this.decodeHTMLEntity($('div.col-md-12 p').text().trim()) ?? ''
        let thumbnail = ''
        if(!image.startsWith('https:')){
            thumbnail = source.baseUrl + image
        } else {
            thumbnail = image
        }
        if (desc == '') desc = `No Decscription provided by the source(${source.baseUrl})`
        let author = $('h4:contains(Yazar:)',infoElement) ?? ''
        author.find('strong').remove()
        let artist = $('h4:contains(Çizer:)',infoElement) ?? ''
        artist.find('strong').remove()
        var stu = $('h4:contains(Durum:)',infoElement)
        stu.find("strong").remove()
        const status = source.parseStatus(stu.first()?.text())
        const arrayTags: Tag[] = []
        for (const tag of $('h4:contains(Türler:) a',infoElement).toArray()) {
            const label = $(tag).text().trim()
            const id = $(tag).attr('href')
            if (!label || !id) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: 'genres', label: 'Genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [title],
            image: thumbnail,
            rating: 0,
            status,
            author: author?.text()?.trim(),
            artist: artist?.text()?.trim(),
            tags: tagSections,
            desc,
            hentai: source.adult,
        })
    }

    override parseChapters($: CheerioStatic, mangaId: string, source: any): Chapter[] {
        const langCode = source.languageCode
        const chapters: Chapter[] = []
        const title = $('.manga-info h1, .manga-info h3').text().trim()
        for (const chapter of $('table.table tbody tr').toArray()) {

            let chapterElem
            if (source.chapterUrlSelector != "") {
                chapterElem = $(source.chapterUrlSelector, chapter)
            }
            else  {
                chapterElem = $(chapter)
            }

            const id = this.idCleaner(chapterElem.attr('href') ?? '',source) ?? ''
            const name = chapterElem.attr('title') ?? chapterElem.text().replace(title, '').trim() ?? ''
            const time = source.parseDate($("td", chapter).last().text().trim())
            const chapNum = this.chapterFromElement(name)
            if (!id) continue
            chapters.push(createChapter({
                id,
                mangaId,
                name,
                langCode,
                chapNum,
                time,
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
        var nextPage = $('ul.pagination li.active + li:not(.disabled)')
        if (nextPage.contents().length !== 0) {
            return true;
        } else {
            return false;
        }
    }
    override parseTags($: CheerioStatic) {
        const genres: Tag[] = [];
        for (const obj of $("div.panel-body a").toArray()) {
            genres.push(createTag({
                id: this.decodeTurkishCharacters($(obj).text().trim()).toLowerCase().replace(/ /gi,'-'),
                label: $(obj).text().trim()
            }));
        }
        return genres;
    }
    decodeTurkishCharacters(text:string): any {
        return text
          .replace(/\ğ/g, "g")
          .replace(/\ü/g, "u")
          .replace(/\ş/g, "s")
          .replace(/\ı/g, "i")
          .replace(/\ö/g, "o")
          .replace(/\ç/g, "c");
      }
}
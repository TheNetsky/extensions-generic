
import { MangaTile } from 'paperback-extensions-common'
import {
    Parser,
} from '../MadaraParser'

export class Manga3asqParser extends Parser {

    override parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        const number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('قبل ساعة') || date.includes('الان') || date.includes('ألان')) {
            time = new Date(Date.now())
        } else if (date.includes('سنة') || date.includes('سنوات') || date.includes('سنوأت')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('شهر') || date.includes('شهور')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('اسبوع') || date.includes('اسوبيعن') || date.includes('اسابيع') || date.includes('أسبوع') || date.includes('أسابيع')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('أسوبيعن')){
            time = new Date(Date.now() - (2 * 604800000))
        } else if (date.includes('يومين')) {
            time = new Date(Date.now() - (2 * 86400000))
        } else if (date.includes('يوم واحد') || date.includes('يوم وأحد')) {
            time = new Date(Date.now() - (1 * 86400000))
        } else if (date.includes('يوم') || date.includes('ايام') || date.includes('أيام')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('ساعة') || date.includes('ساعه') || date.includes('ساعات')) {
            time = new Date(Date.now() - (number * 3600000))
        }  else if (date.includes('ساعة واحدة') || date.includes('ساعة وأحدة')) {
            time = new Date(Date.now() - (1 * 3600000))
        } else if (date.includes('دقيقية') || date.includes('دقائق')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('ثانية') || date.includes('ثانيا') || date.includes('ثواني') || date.includes('ثوأني')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            date = date.replace(/يناير/gi, 'January').replace(/فبراير/gi, 'February').replace(/مارس/gi, 'March').replace(/ابريل+|أبريل/gi, 'April').replace(/مايو/gi, 'May').replace(/يونيو/gi, 'June').replace(/يوليو/gi, 'July').replace(/أغسطس+|اغسطس/gi, 'August').replace(/سبتمبر/gi, 'September').replace(/أكتوبر+|اكتوبر/gi, 'October').replace(/نوفمبر/gi, 'November').replace(/ديسمبر/gi, 'December')
            time = new Date(date)
        }
        return time
    }

    override async parseHomeSection($: CheerioStatic, source: any): Promise<MangaTile[]> {
        const items: MangaTile[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI(await this.getImageSrc($('img', obj), source) ?? '')
            const title = $('a:not([target])', $('h3.h5', obj)).last().text()
            const id = $('a:not([target])', $('h3.h5', obj)).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
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

    override async parseSearchResults($: CheerioSelector, source: any): Promise<MangaTile[]> {
        const results: MangaTile[] = []
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ($('a:not([target])', obj).attr('href') ?? '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const title = $('a:not([target])', obj).attr('title') ?? ''
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
}
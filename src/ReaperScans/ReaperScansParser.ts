import {
    Parser,
} from '../MadaraParser'

import { ReaperScans } from './ReaperScans'

import {
    MangaTile,
} from 'paperback-extensions-common'

//ID's of all the novels on the site
const novelIDArray = [
    '21st-century-archmage',
    'leveling-with-the-gods',
    'the-boundless-necromancer',
    'return-of-the-frozen-player-novel',
    'swordmasters-youngest-son',
    'hyper-luck',
    'the-divine-hunter',
    'the-song-of-sword-and-magic',
    'the-tutorial-is-too-hard-novel'
]

export class ReaperScansParser extends Parser {

    override parseSearchResults($: CheerioSelector, source: ReaperScans): MangaTile[] {
        const results: MangaTile[] = []
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ($('a', $(obj)).attr('href') ?? '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const title = createIconText({ text: this.decodeHTMLEntity($('a', $(obj)).attr('title') ?? '') })
            const image = encodeURI(this.getImageSrc($('img', $(obj))))
            const subtitle = createIconText({ text: $('span.font-meta.chapter', obj).text().trim() })

            if (!id || !image || !title.text) {
                if (id.includes(source.baseUrl.replace(/\/$/, ''))) continue
                // Something went wrong with our parsing, return a detailed error
                throw new Error(`Failed to parse searchResult for ${source.baseUrl} using ${source.searchMangaSelector} as a loop selector`)
            }

            if (novelIDArray.includes(id)) continue //Filter out the novels

            results.push(createMangaTile({
                id: id,
                title: title,
                image: image,
                subtitleText: subtitle
            }))
        }
        return results
    }

    override parseHomeSection($: CheerioStatic, source: ReaperScans): MangaTile[] {
        const items: MangaTile[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI(this.getImageSrc($('img', $(obj))) ?? '')
            const title = this.decodeHTMLEntity($('a', $('h3.h5', $(obj))).text())
            const id = $('a', $('h3.h5', $(obj))).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const subtitle = $('span.font-meta.chapter', obj).first().text().trim()

            if (!id || !title || !image) {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/`)
            }

            if (novelIDArray.includes(id)) continue //Filter out the novels

            items.push(createMangaTile({
                id: id,
                title: createIconText({ text: title }),
                image: image,
                subtitleText: createIconText({ text: subtitle })
            }))
        }
        return items
    }
}
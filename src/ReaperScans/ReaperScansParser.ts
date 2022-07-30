import {
    Parser,
} from '../MadaraParser'

import { ReaperScans } from './ReaperScans'

import {
    MangaTile,
} from 'paperback-extensions-common'

//ID's of all the novels on the site
const novelIDArray = [
    'hyper-luck',
    'villain-hides-his-true-colors',
    'starting-from-the-dragon-tribe',
    '21st-century-archmage',
    'hard-carry-support',
    'the-boundless-necromancer',
    'mightiest-melee-magician',
    'barbarian-quest-novel',
    'necromancer-academys-genius-summoner',
    'depths-of-the-otherworldly-labyrinth',
    'hunter-academys-battle-god',
    'swordmasters-youngest-son',
    'max-talent-player',
    'im-not-a-regressor',
    'i-obtained-a-mythic-item',
    'the-demon-prince-goes-to-the-academy',
    'how-to-survive-at-the-academy',
    'is-this-hero-for-real-novel',
    'star-slaying-swordsman-novel',
    'the-divine-hunter',
    'return-of-the-frozen-player-novel',
    'i-returned-as-a-god',
    'leveling-with-the-gods',
    'the-song-of-sword-and-magic',
    'the-tutorial-is-too-hard-novel',
    'academys-undercover-professor'
]

export class ReaperScansParser extends Parser {

    override async parseSearchResults($: CheerioSelector, source: ReaperScans): Promise<MangaTile[]> {
        const results: MangaTile[] = []
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ($('a', obj).attr('href') ?? '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const title = $('a', obj).attr('title') ?? ''
            const image = encodeURI(await this.getImageSrc($('img', obj), source))
            const subtitle = $('span.font-meta.chapter', obj).text().trim()

            if (!id || !title) {
                if (id.includes(source.baseUrl.replace(/\/$/, ''))) continue
                // Something went wrong with our parsing, return a detailed error
                console.log(`Failed to parse searchResult for ${source.baseUrl} using ${source.searchMangaSelector} as a loop selector`)
                continue
            }

            if (novelIDArray.includes(id)) continue //Filter out the novels

            results.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) })
            }))
        }
        return results
    }

    override async parseHomeSection($: CheerioStatic, source: ReaperScans): Promise<MangaTile[]> {
        const items: MangaTile[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI(await this.getImageSrc($('img', obj), source) ?? '')
            const title = $('a', $('h3.h5', obj)).text()
            const id = $('a', $('h3.h5', obj)).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')
            const subtitle = $('span.font-meta.chapter', obj).first().text().trim()

            if (!id || !title) {
                console.log(`Failed to parse homepage sections for ${source.baseUrl}/`)
                continue
            }


            if (novelIDArray.includes(id)) continue //Filter out the novels

            items.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) })
            }))
        }
        return items
    }
}

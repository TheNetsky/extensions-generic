import {
    Parser
} from '../MadaraParser'

const parser = new Parser()

import { Toonily } from './Toonily'

export class ToonilyParser extends Parser {

    override filterUpdatedManga($: CheerioSelector, time: Date, ids: string[], source: Toonily): { updates: string[], loadNextPage: boolean } {
        let passedReferenceTimePrior = false
        let passedReferenceTimeCurrent = false
        const updatedManga: string[] = []

        for (const obj of $('div.page-item-detail').toArray()) {
            const id = $('a', $('h3.h5', obj)).attr('href')?.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '') ?? ''

            let mangaTime: Date
            const timeSelector = $('span.post-on.font-meta > a, span.post-on.font-meta > span > a', obj).attr('title')
            if (typeof timeSelector !== 'undefined') {
                //Firstly check if there is a NEW tag, if so parse the time from this
                mangaTime = parser.parseDate(timeSelector ?? '')
            } else {
                //New Toonily layout, since it no longer has date, we check if it has the text "UP" meaning it's new!
                if ($('span.post-on.font-meta', obj).first().text().trim().toLocaleUpperCase() == 'UP') {
                    mangaTime = new Date()
                } else {
                    //Else get the date from the span
                    mangaTime = parser.parseDate($('span.post-on.font-meta', obj).first().text().trim())
                }
            }
            //Check if the date is valid, if it isn't we should skip it
            if (!mangaTime.getTime()) continue

            passedReferenceTimeCurrent = mangaTime <= time
            if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
            } else break

            if (typeof id === 'undefined') {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}}/`)
            }
            passedReferenceTimePrior = passedReferenceTimeCurrent
        }
        if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
            return { updates: updatedManga, loadNextPage: true }
        } else {
            return { updates: updatedManga, loadNextPage: false }
        }
    }
}
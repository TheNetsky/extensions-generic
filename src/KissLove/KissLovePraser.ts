import {
    Tag,
} from 'paperback-extensions-common'
import { Parser } from '../FMReaderParser'

export class KissLoveParser extends Parser {
    override parseTags($: CheerioStatic) {
        const genres: Tag[] = [];
        for (const obj of $(".manga-list-genres .panel-body a").toArray()) {
            genres.push(createTag({
                id: encodeURI($(obj).attr('href') ?? ''),
                label: $(obj).text().trim()
            }));
        }
        return genres;
    }
}
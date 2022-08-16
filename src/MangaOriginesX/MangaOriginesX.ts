/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ContentRating,
    SourceInfo,
    TagType
} from 'paperback-extensions-common'

import {
    MangaOriginesInfo,
    MangaOrigines
} from '../MangaOrigines/MangaOrigines'

const DOMAIN = 'https://x.mangas-origines.fr'

export const MangaOriginesXInfo: SourceInfo = {
    ... MangaOriginesInfo,
    name: 'Manga Origines X',
    description: `Extension that pulls manga from ${DOMAIN}`,
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: '18+',
            type: TagType.YELLOW
        },
    ]
}

export class MangaOriginesX extends MangaOrigines {
    override baseUrl: string = DOMAIN;
    override sourceTraversalPathName = 'oeuvre';
}

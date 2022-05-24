import {
    Chapter,
    ChapterDetails,
    HomeSection,
    Manga,
    MangaTile,
    Tag,
    TagSection,
} from 'paperback-extensions-common'

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Manga {
        const infoElement = $('div.row').first()
        const title = this.decodeHTMLEntity($('ul.manga-info > *').first().text().replace(/manhwa/gi, '').replace(/engsub/gi, '').trim()) ?? ''
        const image = this.getImageSrc($('img.thumbnail')) ?? 'https://i.imgur.com/GYUxEX8.png'
        let desc = this.decodeHTMLEntity($('div.detail .content, div.row ~ div.row:has(h3:first-child) p, .summary-content p').text().trim()) ?? ''
        let thumbnail = ''
        if(!image.startsWith('https:')){
            thumbnail = source.baseUrl + image
        } else {
            thumbnail = image
        }
        if (desc == '') desc = `No Decscription provided by the source(${source.baseUrl})`
        let author = $('li a.btn-info').text().trim().replace('Updating', '') ?? ""
        const status = source.parseStatus($('li a.btn-success', infoElement).first()?.text().replace(/ /g, ''))
        const arrayTags: Tag[] = []
        for (const tag of $('li a.btn-danger').toArray()) {
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

    parseChapters($: CheerioStatic, mangaId: string, source: any): Chapter[] {
        const langCode = source.languageCode
        const chapters: Chapter[] = []
        const title = $('.manga-info h1, .manga-info h3').text().trim()
        for (const chapter of $('div#list-chapters p, table.table tr, .list-chapters > a').toArray()) {

            let chapterElem
            if (source.chapterUrlSelector != "") {
                chapterElem = $(source.chapterUrlSelector, chapter)
            }
            else  {
                chapterElem = $(chapter)
            }

            const id = this.idCleaner(chapterElem.attr('href') ?? '',source) ?? ''
            const name = chapterElem.attr('title') ?? chapterElem.text().replace(title, '').trim() ?? ''
            const time = source.parseDate($(source.chapterTimeSelector, chapter).text().trim())
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

    async parseChapterDetails($: CheerioStatic, mangaId: string, chapterId: string, source: any): Promise<ChapterDetails> {
        let pages: string[] = []

        var pagesArr = $(source.chapterDetailsImageSelector).toArray()
        for(const images of pagesArr){
        let page = this.getImageSrc($(images))
        if (!page) {
            throw new Error(`Could not parse page for ${chapterId}`)
        }
         pages.push(page)
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }
    async Base64parseChapterDetails($: CheerioStatic, mangaId: string, chapterId: string, source: any): Promise<ChapterDetails> {
        let pages: string[] = []

        var pagesArr = $(source.chapterDetailsImageSelector).toArray()
        for(const images of pagesArr){
            var page = this.base64check($(images))
            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`)
            }
         pages.push(page)
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }
    base64check(info :any): any {
        var attr = this.getImageSrc(info)
        if(!attr.includes('.')){
           return Buffer.from(attr,'base64').toString('utf8')
        } else {
            return attr
        }
    }
    parseSearchResults($: CheerioSelector, source: any): MangaTile[] {
        const results: MangaTile[] = []
        const arrSearch = $('div.media, .thumb-item-flow').toArray()
        for (const obj of arrSearch) {
            const info = $(source.headerSelector,obj)
            const id = this.idCleaner(info.attr('href') ?? '',source) ?? ''
            const title = info.text().trim() ?? ''
            const image = this.getImageSrc($('img, .thumb-wrapper .img-in-ratio', obj)) ?? 'https://i.imgur.com/GYUxEX8.png'
            let thumbnail = ''
            if(!image.startsWith('https:')){
                thumbnail = source.baseUrl + image
            } else {
                thumbnail = image
            }
            results.push(
                createMangaTile({
                    id,
                    image: thumbnail,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                }))
        }
        return results
    }

    NextPage($: CheerioSelector) {
        var nextPage = $('div.col-lg-9 button.btn-info, .pagination a:contains(»):not(.disabled)');
        if (nextPage.contents().length !== 0) {
            return true;
        } else {
            return false;
        }
    }
    parseTags($: CheerioStatic) {
        const genres: Tag[] = [];
        for (const obj of $("div.panel-body a").toArray()) {
            genres.push(createTag({
                id: encodeURI($(obj).text().trim().toLowerCase().replace(/ /gi, '-')),
                label: $(obj).text().trim()
            }));
        }
        return genres;
    }
    async parseHomeSections(popularCE: CheerioStatic, LatestCE: CheerioStatic, sectionCallback: (section: HomeSection) => void, source: any): Promise<void> {
        const section1 = createHomeSection({ id: '1', title: 'Latest Releases', view_more: true})
        const section2 = createHomeSection({ id: '2', title: 'Popular Manhwa', view_more: true})

        const popular : MangaTile[] = []
        const latest  : MangaTile[] = []

        const arrLatest  = LatestCE('div.media, .thumb-item-flow').toArray()
        const arrPopular = popularCE('div.media, .thumb-item-flow').toArray()

        for (const obj of arrLatest) {
            const info = LatestCE(source.headerSelector,obj)
            const id = this.idCleaner(info.attr('href') ?? '',source) ?? ''
            const title = info.text().replace(/manhwa/gi, '').replace(/engsub/gi, '').trim() ?? ''
            const image = this.getImageSrc(LatestCE('img, .thumb-wrapper .img-in-ratio', obj)) ?? 'https://i.imgur.com/GYUxEX8.png'
            console.log(`image is ${image}`)
            let thumbnail = ''
            if(!image.includes("https:")){
                thumbnail = source.baseUrl + image
            } else {
                thumbnail = image
            }
            latest.push(
                createMangaTile({
                    id,
                    image: thumbnail,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                }))
        }
        section1.items = latest
        sectionCallback(section1)

        for (const obj of arrPopular) {
            const info = popularCE(source.headerSelector,obj)
            const id = this.idCleaner(info.attr('href') ?? '',source) ?? ''
            const title = info.text().replace(/manhwa/gi, '').replace(/engsub/gi, '').trim() ?? ''
            const image = this.getImageSrc(popularCE('img, .thumb-wrapper .img-in-ratio', obj)) ?? 'https://i.imgur.com/GYUxEX8.png'
            let thumbnail = ''
            if(!image.includes("https:")){
                thumbnail = source.baseUrl + image 
            } else {
                thumbnail = image
            }
            popular.push(
                createMangaTile({
                    id,
                    image: thumbnail ?? "https://i.imgur.com/GYUxEX8.png",
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                })
            )
        }
        section2.items = popular
        sectionCallback(section2)
    }

    filterUpdatedManga($: CheerioSelector, time: Date, ids: string[], source: any): string[] {
        let passedReferenceTimePrior = false
        let passedReferenceTimeCurrent = false
        const updatedManga: string[] = []
        // taken from https://github.com/pandeynmn/extensions-foreign/tree/ninemanga
        for (const obj of $('div.media, .thumb-item-flow').toArray()) {
            const info = $(source.headerSelector,obj)
            const id = info.attr('href')  ?? ''

            let mangaTime: Date
            const timeSelector = $('.timeago',obj).attr('title') ?? $('.timeago',obj).text().trim() ?? ''
            // eslint-disable-next-line prefer-const
            mangaTime = source.parseDate(timeSelector ?? '')

            // Check if the date is valid, if it isn't we should skip it
            if (!mangaTime.getTime()) continue

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
        return updatedManga
    }
    
    protected decodeBase64ImageSrc(elem: Cheerio): string {
        let attr = this.getImageSrc(elem)
        if (!elem.attr(attr)?.includes('.')) {
            return atob((elem.attr(attr)) ?? '')
        } else {
            return elem.attr(`abs:${attr}`) ?? ''
        }
    }

    getImageSrc(imageObj: Cheerio | undefined): string {
        let image
        if(typeof imageObj?.attr('data-original') != 'undefined') {
            image = imageObj?.attr('data-original')
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
        return str.replace(/&#(\d+);/g, function (_match, dec) {
            return String.fromCharCode(dec);
        })
    }
    chapterFromElement(name: string){
        var chapterNumber = '';
        const regex = RegExp(/\b\d+\.?\d?\b/g);
        if (name != null){
            var numbers = name.match(regex);
            if (numbers != null){
                if(numbers.length > 0){
                    chapterNumber = numbers[0] ?? '';
                    var indexOfFirstNumber = name.indexOf(numbers[0]?? '');
                    var indexOfIssueNumberSign = name.indexOf('#');
                    if (indexOfFirstNumber > indexOfIssueNumberSign){
                        chapterNumber = numbers[0] ?? ''; 
                    }
                    else if (numbers.length > 1){
                        chapterNumber = numbers[1] ?? '';
                    }
                }
                else {
                    chapterNumber = "?";
                }
            }
            else {
                chapterNumber = "?";
            }
        } else {
            chapterNumber = "?";
        }
        
        
        return parseInt(chapterNumber)
    }
    idCleaner(str: string, source: any): string {
        const base = source.baseUrl.split('://').pop()
        str = str.replace(/(https:\/\/|http:\/\/)/, '')
        str = str.replace(/\/$/, '')
        str = str.replace(`${base}/`, '')
        str = str.replace(`${source.sourceTraversalPathName}/`, '')
        return str
    }
}

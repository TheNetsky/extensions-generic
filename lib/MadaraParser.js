"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    parseMangaDetails($, mangaId) {
        var _a, _b;
        const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1];
        const title = this.decodeHTMLEntity($('div.post-title h1').children().remove().end().text().trim());
        const author = this.decodeHTMLEntity($('div.author-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown');
        const artist = this.decodeHTMLEntity($('div.artist-content').first().text().replace('\\n', '').trim()).replace('Updating', 'Unknown');
        const summary = this.decodeHTMLEntity($('div.description-summary').first().text()).replace('Show more', '').trim();
        const image = encodeURI(this.getImageSrc($('div.summary_image img').first()));
        const rating = $('span.total_votes').text().replace('Your Rating', '');
        const isOngoing = $('div.summary-content', $('div.post-content_item').last()).text().toLowerCase().trim() == 'ongoing';
        const genres = [];
        let hentai = $('.manga-title-badges.adult').length > 0;
        // Grab genres and check for smut tag
        for (const obj of $('div.genres-content a').toArray()) {
            const label = $(obj).text();
            const id = (_b = (_a = $(obj).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/')[4]) !== null && _b !== void 0 ? _b : label;
            if (label.toLowerCase().includes('smut'))
                hentai = true;
            genres.push(createTag({ label: label, id: id }));
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: genres })];
        // If we cannot parse out the data-id for this title, we cannot complete subsequent requests
        if (!numericId) {
            throw new Error(`Could not parse out the data-id for ${mangaId} - This method might need overridden in the implementing source`);
        }
        // If we do not have a valid image, something is wrong with the generic parsing logic. A source should always remedy this with
        // a custom implementation.
        if (!image) {
            throw new Error(`Could not parse out a valid image while parsing manga details for manga: ${mangaId}`);
        }
        return createManga({
            id: mangaId,
            titles: [title],
            image: image,
            author: author,
            artist: artist,
            tags: tagSections,
            desc: summary,
            status: isOngoing ? paperback_extensions_common_1.MangaStatus.ONGOING : paperback_extensions_common_1.MangaStatus.COMPLETED,
            rating: Number(rating),
            hentai: hentai
        });
    }
    parseChapterList($, mangaId, source) {
        var _a, _b, _c, _d;
        const chapters = [];
        // Capture the manga title, as this differs from the ID which this function is fed
        const realTitle = (_a = $('a', $('li.wp-manga-chapter  ').first()).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').toLowerCase().replace(/\/chapter.*/, '');
        if (!realTitle) {
            throw new Error(`Failed to parse the human-readable title for ${mangaId}`);
        }
        // For each available chapter..
        for (const obj of $('li.wp-manga-chapter  ').toArray()) {
            const id = ($('a', $(obj)).first().attr('href') || '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '');
            const chapNum = Number((_b = id.match(/\D*(\d*\.?\d*)$/)) === null || _b === void 0 ? void 0 : _b.pop());
            const chapName = $('a', $(obj)).first().text();
            const releaseDate = $('i', $(obj)).length > 0 ? $('i', $(obj)).text() : (_c = $('.c-new-tag a', $(obj)).attr('title')) !== null && _c !== void 0 ? _c : '';
            if (typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`);
            }
            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                langCode: (_d = source.languageCode) !== null && _d !== void 0 ? _d : paperback_extensions_common_1.LanguageCode.UNKNOWN,
                chapNum: Number.isNaN(chapNum) ? 0 : chapNum,
                name: Number.isNaN(chapNum) ? chapName : undefined,
                time: source.convertTime(releaseDate)
            }));
        }
        return this.sortChapters(chapters);
    }
    parseChapterDetails($, mangaId, chapterId, selector) {
        const pages = [];
        for (const obj of $(selector).toArray()) {
            const page = this.getImageSrc($(obj));
            if (!page) {
                throw new Error(`Could not parse page for ${mangaId}/${chapterId}`);
            }
            pages.push(page);
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        });
    }
    parseTags($, advancedSearch) {
        var _a, _b, _c;
        const genres = [];
        if (advancedSearch) {
            for (const obj of $('.checkbox-group div label').toArray()) {
                const label = $(obj).text().trim();
                const id = (_a = $(obj).attr('for')) !== null && _a !== void 0 ? _a : label;
                genres.push(createTag({ label: label, id: id }));
            }
        }
        else {
            for (const obj of $('.menu-item-object-wp-manga-genre a', $('.second-menu')).toArray()) {
                const label = $(obj).text().trim();
                const id = (_c = (_b = $(obj).attr('href')) === null || _b === void 0 ? void 0 : _b.split('/')[4]) !== null && _c !== void 0 ? _c : label;
                genres.push(createTag({ label: label, id: id }));
            }
        }
        return [createTagSection({ id: '0', label: 'genres', tags: genres })];
    }
    parseSearchResults($, source) {
        var _a, _b;
        const results = [];
        for (const obj of $(source.searchMangaSelector).toArray()) {
            const id = ((_a = $('a', $(obj)).attr('href')) !== null && _a !== void 0 ? _a : '').replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '');
            const title = createIconText({ text: this.decodeHTMLEntity((_b = $('a', $(obj)).attr('title')) !== null && _b !== void 0 ? _b : '') });
            const image = encodeURI(this.getImageSrc($('img', $(obj))));
            if (!id || !image || !title.text) {
                if (id.includes(source.baseUrl.replace(/\/$/, '')))
                    continue;
                // Something went wrong with our parsing, return a detailed error
                throw new Error(`Failed to parse searchResult for ${source.baseUrl} using ${source.searchMangaSelector} as a loop selector`);
            }
            results.push(createMangaTile({
                id: id,
                title: title,
                image: image
            }));
        }
        return results;
    }
    parseHomeSection($, source) {
        var _a, _b;
        const items = [];
        for (const obj of $('div.page-item-detail').toArray()) {
            const image = encodeURI((_a = this.getImageSrc($('img', $(obj)))) !== null && _a !== void 0 ? _a : '');
            const title = this.decodeHTMLEntity($('a', $('h3.h5', $(obj))).text());
            const id = (_b = $('a', $('h3.h5', $(obj))).attr('href')) === null || _b === void 0 ? void 0 : _b.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '');
            if (!id || !title || !image) {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/`);
            }
            items.push(createMangaTile({
                id: id,
                title: createIconText({ text: title }),
                image: image
            }));
        }
        return items;
    }
    filterUpdatedManga($, time, ids, source) {
        var _a, _b, _c, _d;
        let passedReferenceTimePrior = false;
        let passedReferenceTimeCurrent = false;
        const updatedManga = [];
        for (const obj of $('div.page-item-detail').toArray()) {
            const id = (_b = (_a = $('a', $('h3.h5', obj)).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${source.baseUrl}/${source.sourceTraversalPathName}/`, '').replace(/\/$/, '')) !== null && _b !== void 0 ? _b : '';
            let mangaTime;
            if ($('.c-new-tag a', obj).length > 0) {
                // Use blinking red NEW tag
                mangaTime = source.convertTime((_c = $('.c-new-tag a', obj).attr('title')) !== null && _c !== void 0 ? _c : '');
            }
            else {
                // Use span
                mangaTime = source.convertTime((_d = $('span', $('.chapter-item', obj).first()).last().text()) !== null && _d !== void 0 ? _d : '');
            }
            passedReferenceTimeCurrent = mangaTime <= time;
            if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
                if (ids.includes(id)) {
                    updatedManga.push(id);
                }
            }
            else
                break;
            if (typeof id === 'undefined') {
                throw new Error(`Failed to parse homepage sections for ${source.baseUrl}/${source.homePage}/`);
            }
            passedReferenceTimePrior = passedReferenceTimeCurrent;
        }
        if (!passedReferenceTimeCurrent || !passedReferenceTimePrior) {
            return { updates: updatedManga, loadNextPage: true };
        }
        else {
            return { updates: updatedManga, loadNextPage: false };
        }
    }
    // UTILITY METHODS
    // Chapter sorting
    sortChapters(chapters) {
        const sortedChapters = chapters.filter((obj, index, arr) => arr.map(mapObj => mapObj.id).indexOf(obj.id) === index);
        sortedChapters.sort((a, b) => (a.chapNum - b.chapNum) ? -1 : 1);
        return sortedChapters;
    }
    getImageSrc(imageObj) {
        var _a, _b, _c;
        let image;
        if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src')) != 'undefined') {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src');
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src')) != 'undefined') {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src');
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) != 'undefined') {
            image = (_b = (_a = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) !== null && _b !== void 0 ? _b : '';
        }
        else {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('src');
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity((_c = image === null || image === void 0 ? void 0 : image.trim()) !== null && _c !== void 0 ? _c : '')));
    }
    decodeHTMLEntity(str) {
        return str.replace(/&#(\d+);/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });
    }
}
exports.Parser = Parser;

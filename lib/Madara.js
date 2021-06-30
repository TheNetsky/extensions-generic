"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Madara = void 0;
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MadaraParser_1 = require("./MadaraParser");
class Madara extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 3
        });
        /**
         * The path that precedes a manga page not including the Madara URL.
         * Eg. for https://www.webtoon.xyz/read/limit-breaker/ it would be 'read'.
         * Used in all functions.
         */
        this.sourceTraversalPathName = 'manga';
        /**
         * Different Madara sources might have a slightly different selector which is required to parse out
         * each manga object while on a search result page. This is the selector
         * which is looped over. This may be overridden if required.
         */
        this.searchMangaSelector = 'div.c-tabs-item__content';
        /**
         * Set to true if your source has advanced search functionality built in.
         */
        this.hasAdvancedSearchPage = false;
        /**
         * Different Madara sources might require a extra param in order for the images to be parsed.
         * Eg. for https://arangscans.com/manga/tesla-note/chapter-3/?style=list "?style=list" would be the param
         * added to the end of the URL. This will set the page in list style and is needed in order for the
         * images to be parsed. Params can be addded if required.
         */
        this.chapterDetailsParam = '';
        /**
         * Different Madara sources might have a slightly different selector which is required to parse out
         * each page while on a chapter page. This is the selector
         * which is looped over. This may be overridden if required.
         */
        this.chapterDetailsSelector = 'div.page-break > img';
        /**
         * Set to false if your source has individual buttons for each page as opposed to a 'LOAD MORE' button
         */
        this.loadMoreSearchManga = true;
        /**
        * Helps with CloudFlare for some sources, makes it worse for others; override with empty string if the latter is true
        */
        this.userAgentRandomizer = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/78.0${Math.floor(Math.random() * 100000)}`;
        this.parser = new MadaraParser_1.Parser();
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
                method: 'GET',
                headers: this.constructHeaders({})
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseMangaDetails($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
                method: 'POST',
                headers: this.constructHeaders({
                    'content-type': 'application/x-www-form-urlencoded'
                }),
                data: {
                    'action': 'manga_get_chapters',
                    'manga': yield this.getNumericId(mangaId)
                }
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseChapterList($, mangaId, this);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${this.sourceTraversalPathName}/${chapterId}/`,
                method: 'GET',
                headers: this.constructHeaders(),
                cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl })],
                param: this.chapterDetailsParam
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseChapterDetails($, mangaId, chapterId, this.chapterDetailsSelector);
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            let request;
            if (this.hasAdvancedSearchPage) {
                request = createRequestObject({
                    url: `${this.baseUrl}/?s=&post_type=wp-manga`,
                    method: 'GET',
                    headers: this.constructHeaders()
                });
            }
            else {
                request = createRequestObject({
                    url: `${this.baseUrl}/`,
                    method: 'GET',
                    headers: this.constructHeaders()
                });
            }
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            return this.parser.parseTags($, this.hasAdvancedSearchPage);
        });
    }
    searchRequest(query, metadata) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 0;
            const request = this.constructAjaxRequest(page, 50, '', (_b = query.title) !== null && _b !== void 0 ? _b : '');
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const manga = this.parser.parseSearchResults($, this);
            let mData = { page: (page + 1) };
            if (manga.length < 50) {
                mData = undefined;
            }
            return createPagedResults({
                results: manga,
                metadata: typeof (mData === null || mData === void 0 ? void 0 : mData.page) === 'undefined' ? undefined : mData
            });
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
            let page = 0;
            let loadNextPage = true;
            while (loadNextPage) {
                const request = this.constructAjaxRequest(page, 50, '_latest_update', '');
                const data = yield this.requestManager.schedule(request, 1);
                this.CloudFlareError(data.status);
                const $ = this.cheerio.load(data.data);
                const updatedManga = this.parser.filterUpdatedManga($, time, ids, this);
                loadNextPage = updatedManga.loadNextPage;
                if (loadNextPage) {
                    page++;
                }
                if (updatedManga.updates.length > 0) {
                    mangaUpdatesFoundCallback(createMangaUpdates({
                        ids: updatedManga.updates
                    }));
                }
            }
        });
    }
    /**
     * It's hard to capture a default logic for homepages. So for Madara sources,
     * instead we've provided a homesection reader for the base_url/source_traversal_path/ endpoint.
     * This supports having paged views in almost all cases.
     * @param sectionCallback
     */
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const sections = [
                {
                    request: this.constructAjaxRequest(0, 10, '_latest_update', ''),
                    section: createHomeSection({
                        id: '0',
                        title: 'RECENTLY UPDATED',
                        view_more: true,
                    }),
                },
                {
                    request: this.constructAjaxRequest(0, 10, '_wp_manga_week_views_value', ''),
                    section: createHomeSection({
                        id: '1',
                        title: 'CURRENTLY TRENDING',
                        view_more: true,
                    })
                },
                {
                    request: this.constructAjaxRequest(0, 10, '_wp_manga_views', ''),
                    section: createHomeSection({
                        id: '2',
                        title: 'MOST POPULAR',
                        view_more: true,
                    })
                },
            ];
            const promises = [];
            for (const section of sections) {
                // Let the app load empty sections
                sectionCallback(section.section);
                // Get the section data
                promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                    this.CloudFlareError(response.status);
                    const $ = this.cheerio.load(response.data);
                    section.section.items = this.parser.parseHomeSection($, this);
                    sectionCallback(section.section);
                }));
            }
            // Make sure the function completes
            yield Promise.all(promises);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // We only have one homepage section ID, so we don't need to worry about handling that any
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 0; // Default to page 0
            let sortBy = '';
            switch (homepageSectionId) {
                case '0': {
                    sortBy = '_latest_update';
                    break;
                }
                case '1': {
                    sortBy = '_wp_manga_week_views_value';
                    break;
                }
                case '2': {
                    sortBy = '_wp_manga_views';
                    break;
                }
            }
            const request = this.constructAjaxRequest(page, 50, sortBy, '');
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const items = this.parser.parseHomeSection($, this);
            // Set up to go to the next page. If we are on the last page, remove the logic.
            let mData = { page: (page + 1) };
            if (items.length < 50) {
                mData = undefined;
            }
            return createPagedResults({
                results: items,
                metadata: mData
            });
        });
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: this.constructHeaders()
        });
    }
    getNumericId(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${this.sourceTraversalPathName}/${mangaId}/`,
                method: 'GET',
                headers: this.constructHeaders()
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const numericId = $('script#wp-manga-js-extra').get()[0].children[0].data.match('"manga_id":"(\\d+)"')[1];
            if (!numericId) {
                throw new Error(`Failed to parse the numeric ID for ${mangaId}`);
            }
            return numericId;
        });
    }
    /**
     * Constructs requests to be sent to the Madara /admin-ajax.php endpoint.
     */
    constructAjaxRequest(page, postsPerPage, meta_key, searchQuery) {
        const isSearch = searchQuery != '';
        const data = {
            'action': 'madara_load_more',
            'page': page,
            'vars[paged]': '1',
            'vars[posts_per_page]': postsPerPage,
        };
        if (isSearch) {
            data['vars[s]'] = searchQuery;
            data['template'] = 'madara-core/content/content-search';
        }
        else {
            data['template'] = 'madara-core/content/content-archive';
            data['vars[orderby]'] = 'meta_value_num';
            data['vars[sidebar]'] = 'right';
            data['vars[post_type]'] = 'wp-manga';
            data['vars[meta_key]'] = meta_key;
            data['vars[order]'] = 'desc';
        }
        return createRequestObject({
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: this.constructHeaders({
                'content-type': 'application/x-www-form-urlencoded'
            }),
            data: data,
            cookies: [createCookie({ name: 'wpmanga-adault', value: '1', domain: this.baseUrl })]
        });
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     */
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(timeAgo);
        }
        return time;
    }
    constructHeaders(headers, refererPath) {
        headers = headers !== null && headers !== void 0 ? headers : {};
        if (this.userAgentRandomizer !== '') {
            headers['user-agent'] = this.userAgentRandomizer;
        }
        headers['referer'] = `${this.baseUrl}${refererPath !== null && refererPath !== void 0 ? refererPath : ''}`;
        return headers;
    }
    globalRequestHeaders() {
        if (this.userAgentRandomizer !== '') {
            return {
                'referer': `${this.baseUrl}/`,
                'user-agent': this.userAgentRandomizer,
                'accept': 'image/jpeg,image/png,image/*;q=0.8'
            };
        }
        else {
            return {
                'referer': `${this.baseUrl}/`,
                'accept': 'image/jpeg,image/png,image/*;q=0.8'
            };
        }
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > \<\The name of this source\> and press Cloudflare Bypass');
        }
    }
}
exports.Madara = Madara;

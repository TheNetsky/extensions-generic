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
exports.GuyaBase = exports.getExportVersion = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const BASE_VERSION = '1.0.1';
const getExportVersion = (EXTENSION_VERSION) => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.');
};
exports.getExportVersion = getExportVersion;
class GuyaBase extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        /**
         * Fallback image if no image is present
         * Default = "https://i.imgur.com/GYUxEX8.png"
         */
        this.fallbackImage = 'https://i.imgur.com/GYUxEX8.png';
        //----REQUEST MANAGER----
        this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: (request) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    request.headers = Object.assign(Object.assign({}, ((_a = request.headers) !== null && _a !== void 0 ? _a : {})), {
                        'referer': `${this.baseUrl}/`
                    });
                    return request;
                }),
                interceptResponse: (response) => __awaiter(this, void 0, void 0, function* () {
                    return response;
                })
            }
        });
    }
    getMangaShareUrl(mangaId) { return `${this.baseUrl}/read/manga/${mangaId}`; }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/series_page_data/${mangaId}`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const titles = [].concat(data.series).concat(data.alt_titles);
            return createManga({
                id: mangaId,
                titles: titles,
                image: data.cover_vol_url ? this.baseUrl + data.cover_vol_url : this.fallbackImage,
                status: paperback_extensions_common_1.MangaStatus.ONGOING,
                author: data.metadata[0][1],
                artist: data.metadata[1][1],
                desc: data.synopsis,
            });
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/series/${mangaId}`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const rawChapters = data.chapters;
            const chapters = [];
            for (const c in rawChapters) {
                const chapter = rawChapters[c];
                for (const group in chapter.groups) {
                    chapters.push(createChapter({
                        id: `${c}&&${chapter.folder}&&${group}`,
                        mangaId: mangaId,
                        name: chapter.title,
                        langCode: this.languageCode,
                        chapNum: isNaN(Number(c)) ? 0 : Number(c),
                        volume: chapter.volume,
                        time: new Date(chapter.release_date[group] * 1000),
                    }));
                }
            }
            return chapters;
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/series/${mangaId}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const rawChapters = data.chapters;
            const [chapterNum, storage, group] = chapterId.split('&&');
            storage;
            group;
            const pages = [];
            const images = rawChapters[Number(chapterNum)].groups[Number(group)];
            for (const image of images) {
                pages.push(`${this.baseUrl}/media/manga/${mangaId}/chapters/${storage}/${group}/${image}`);
            }
            return createChapterDetails({
                id: chapterId,
                longStrip: false,
                mangaId: mangaId,
                pages: pages
            });
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/get_all_series`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const updatedManga = [];
            for (const item in data) {
                const manga = data[item];
                const mangaDate = new Date(manga.last_updated * 1000);
                const id = manga.slug;
                if (mangaDate > time) {
                    if (ids.includes(id)) {
                        updatedManga.push(id);
                    }
                }
            }
            if (updatedManga.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga
                }));
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/get_all_series`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const sections = [
                createHomeSection({ id: 'featured', title: 'Featured Items', type: paperback_extensions_common_1.HomeSectionType.singleRowLarge, view_more: true }),
            ];
            const mangaArray = [];
            for (const item in data) {
                const manga = data[item];
                const id = manga.slug;
                mangaArray.push(createMangaTile({
                    id: id,
                    image: manga.cover ? this.baseUrl + manga.cover : this.fallbackImage,
                    title: createIconText({ text: item })
                }));
            }
            for (const section of sections) {
                section.items = mangaArray.slice(0, 10);
                sectionCallback(section);
            }
        });
    }
    getViewMoreItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/get_all_series`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const mangaArray = [];
            for (const item in data) {
                const manga = data[item];
                const id = manga.slug;
                mangaArray.push(createMangaTile({
                    id: id,
                    image: manga.cover ? this.baseUrl + manga.cover : this.fallbackImage,
                    title: createIconText({ text: item })
                }));
            }
            return createPagedResults({
                results: mangaArray
            });
        });
    }
    getSearchResults(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/api/get_all_series`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(request, 1);
            const data = (typeof response.data === 'string') ? JSON.parse(response.data) : response.data;
            const searchQuery = query.title ? query.title.toLowerCase() : '';
            const searchFiltered = Object.keys(data).filter((e) => e.toLowerCase().includes(searchQuery));
            const results = [];
            for (const item of searchFiltered) {
                const manga = data[item];
                manga;
                results.push(createMangaTile({
                    id: manga.slug,
                    image: manga.cover ? this.baseUrl + manga.cover : this.fallbackImage,
                    title: createIconText({ text: item })
                }));
            }
            return createPagedResults({ results: results });
        });
    }
}
exports.GuyaBase = GuyaBase;

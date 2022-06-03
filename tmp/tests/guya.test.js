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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Guya_1 = require("../Guya/Guya");
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
describe('Guya Tests', () => {
    const wrapper = new paperback_extensions_common_1.APIWrapper();
    const source = new Guya_1.Guya(cheerio_1.default);
    const expect = chai_1.default.expect;
    chai_1.default.use(chai_as_promised_1.default);
    /**
   * The Manga ID which this unit test uses to base it's details off of.
   * Try to choose a manga which is updated frequently, so that the historical checking test can
   * return proper results, as it is limited to searching 30 days back due to extremely long processing times otherwise.
   */
    const mangaId = 'aguya-Wants-To-Be-Confessed-To'; // aguya-Wants-To-Be-Confessed-To
    it('Retrieve Manga Details', () => __awaiter(void 0, void 0, void 0, function* () {
        const details = yield wrapper.getMangaDetails(source, mangaId);
        expect(details, 'No results found with test-defined ID [' + mangaId + ']').to.exist;
        // Validate that the fields are filled
        const data = details;
        expect(data.image, 'Missing Image').to.be.not.empty;
        expect(data.status, 'Missing Status').to.exist;
        expect(data.desc, 'Missing Description').to.be.not.empty;
        expect(data.titles, 'Missing Titles').to.be.not.empty;
        //expect(data.rating, 'Missing Rating').to.exist
    }));
    it('Get Chapters', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield wrapper.getChapters(source, mangaId);
        expect(data, 'No chapters present for: [' + mangaId + ']').to.not.be.empty;
        const entry = data[0];
        expect(entry === null || entry === void 0 ? void 0 : entry.id, 'No ID present').to.not.be.empty;
        expect(entry === null || entry === void 0 ? void 0 : entry.name, 'No title available').to.not.be.empty;
        expect(entry === null || entry === void 0 ? void 0 : entry.chapNum, 'No chapter number present').to.not.be.null;
    }));
    it('Get Chapter Details', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const chapters = yield wrapper.getChapters(source, mangaId);
        //      const chapter = chapters[0]
        //        console.log(chapter)
        const data = yield wrapper.getChapterDetails(source, mangaId, (_b = (_a = chapters[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 'unknown');
        expect(data, 'No server response').to.exist;
        expect(data, 'Empty server response').to.not.be.empty;
        expect(data.id, 'Missing ID').to.be.not.empty;
        expect(data.mangaId, 'Missing MangaID').to.be.not.empty;
        expect(data.pages, 'No pages present').to.be.not.empty;
    }));
    it('Testing home page results for featured titles', () => __awaiter(void 0, void 0, void 0, function* () {
        const results = yield wrapper.getViewMoreItems(source, 'featured', {}, 1);
        expect(results, 'This section does not exist').to.exist;
        expect(results, 'No results whatsoever for this section').to.be.not.empty;
    }));
    it('Testing search', () => __awaiter(void 0, void 0, void 0, function* () {
        const testSearch = {
            title: 'love',
            parameters: {
                includedTags: ['action']
            }
        };
        const search = yield wrapper.searchRequest(source, testSearch, 1);
        const result = search.results[0];
        expect(result, 'No response from server').to.exist;
        expect(result === null || result === void 0 ? void 0 : result.id, 'No ID found for search query').to.be.not.empty;
        expect(result === null || result === void 0 ? void 0 : result.image, 'No image found for search').to.be.not.empty;
        expect(result === null || result === void 0 ? void 0 : result.title, 'No title').to.be.not.null;
        expect(result === null || result === void 0 ? void 0 : result.subtitleText, 'No subtitle text').to.be.not.null;
    }));
    it('Testing Home-Page aquisition', () => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        const homePages = yield wrapper.getHomePageSections(source);
        expect(homePages, 'No response from server').to.exist;
        expect((_c = homePages[0]) === null || _c === void 0 ? void 0 : _c.items, 'No items present').to.exist;
    }));
    it('Testing Notifications', () => __awaiter(void 0, void 0, void 0, function* () {
        const updates = yield wrapper.filterUpdatedManga(source, new Date('2021-9-10'), [mangaId]);
        expect(updates, 'No server response').to.exist;
        expect(updates, 'Empty server response').to.not.be.empty;
        expect(updates[0], 'No updates').to.not.be.empty;
    }));
});

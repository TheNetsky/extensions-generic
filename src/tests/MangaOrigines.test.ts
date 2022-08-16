import cheerio from 'cheerio'
import {
    APIWrapper,
    SearchRequest,
    Source
} from 'paperback-extensions-common'
import { MangaOrigines } from '../MangaOrigines/MangaOrigines'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

describe('MangaOrigines Tests', () => {

    const wrapper: APIWrapper = new APIWrapper()
    const source: Source = new MangaOrigines(cheerio)
    const expect = chai.expect
    chai.use(chaiAsPromised)

    /**
     * The Manga ID which this unit test uses to base it's details off of.
     * Try to choose a manga which is updated frequently, so that the historical checking test can
     * return proper results, as it is limited to searching 30 days back due to extremely long processing times otherwise.
     */
    const mangaId = 'martial-peak'

    it('Retrieve Manga Details', async () => {
        const details = await wrapper.getMangaDetails(source, mangaId)
        expect(details, 'No results found with test-defined ID [' + mangaId + ']').to.exist

        // Validate that the fields are filled
        const data = details
        expect(data.image, 'Missing Image').to.be.not.empty
        expect(data.status, 'Missing Status').to.exist
        expect(data.author, 'Missing Author').to.be.not.empty
        expect(data.desc, 'Missing Description').to.be.not.empty
        expect(data.titles, 'Missing Titles').to.be.not.empty
        expect(data.tags, 'Missing Genres').to.be.not.empty
    })

    it('Get Chapters', async () => {
        const data = await wrapper.getChapters(source, mangaId)

        expect(data, 'No chapters present for: [' + mangaId + ']').to.not.be.empty

        const entry = data[0]
        expect(entry?.id, 'No ID present').to.not.be.empty
        expect(entry?.mangaId, 'MangaId Changed').to.be.eql(mangaId)
        // expect(entry?.time, 'No date present').to.exist
        expect(entry?.name, "No title available").to.not.be.empty
        expect(entry?.chapNum, 'No chapter number present').to.exist
    })

    it('Get Chapter Details', async () => {

        const chapters = await wrapper.getChapters(source, mangaId)
        const data = await wrapper.getChapterDetails(source, mangaId, chapters[0]?.id ?? 'unknown')

        expect(data, 'No server response').to.exist
        expect(data, 'Empty server response').to.not.be.empty

        expect(data.id, 'Missing ID').to.be.not.empty
        expect(data.mangaId, 'Missing MangaID').to.be.not.empty
        expect(data.pages, 'No pages present').to.be.not.empty
    })

    it('Testing search', async () => {
        const testSearch: SearchRequest = {
            title: 'Martial Peak',
            parameters: {},
        }

        const search = await wrapper.searchRequest(source, testSearch, { offset: 0 })
        const result = search.results[0]

        expect(result, 'No response from server').to.exist

        expect(result?.id, 'No ID found for search query').to.be.not.empty
        expect(result?.image, 'No image found for search').to.be.not.empty
        expect(result?.title, 'No title').to.be.not.null
        expect(result?.subtitleText, 'No subtitle text').to.be.not.null
    })

    it('Testing Home-Page aquisition', async () => {
        const homePages = await wrapper.getHomePageSections(source)
        expect(homePages, 'No response from server').to.exist
        expect(homePages[0], 'No latest updates section available').to.exist
        expect(homePages[1], 'No hot section available').to.exist
    })
})

import axios from 'axios';
import cheerio from 'cheerio';
import { Apartment } from '../models/apartment';

const url = 'https://www.idealista.com/areas/alquiler-viviendas/';
const filters = 'con-precio-hasta_550,precio-desde_200/';
const area = '?shape=%28%28ekbhGbfyb%40s%5C%3FgSiC%7BIiRbBiRzI%7Bi%40q%40se%40uCoT%7BImTkHcAeE%7EMkH%3F%3FqG%7CIoToKrGtCiR%7DI%3Fo%40wIhHiClK_NaBwIyFgCtCsGpNvI%3FePmKal%40uC%7Bi%40%3Fyv%40p%40mE%3Fst%40bBqG%60B%7Di%40fE%7Di%40bBqGjHor%40hHeP%7CW%7BZjHiCzW%3F%60MlEfSvXlKja%40bB%7EMjHdPzItIvQgCfSePng%40en%40jHmE%60%5D%7DZvm%40_%5D%60%5BbAjHhCtQpVbB%60N%3FvXnKbP%3FrGjHbP%3F%60NpNvXvQvg%40%3Frt%40pNdP%3FdPdPbPtCzK%3Fnc%40hHvXvQd_%40lKre%40%3FbP%7CIdPxF%3Fq%40d_%40uCvXoK%7EMuQja%40kHpGkHvXmKpGkHdPci%40cA%7Bb%40sVoYwXwF_Nuj%40c%7B%40gEuIyTsG%7DW%3FuQhCia%40%60%5DgSlTgE%3Fyb%40%60%5D%7DIfC_MdPgE%60%5DqNre%40yFpG%29%29&ordenado-por=fecha-publicacion-desc';
const fullUrl = url + filters + area;

export const getPublications = async (): Promise<Apartment[]> => {
    try {
        console.log('Going to make a call to:', fullUrl);
        const response = await axios.get(fullUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive'
            }
        });

        const $ = cheerio.load(response.data);
        const articles = $('article.item');
        let apartments: Apartment[] = [];

        articles.each((index, element) => {
            const title = $(element).find('a.item-link').text().trim();
            const description = $(element).find('div.item-description p.ellipsis').text().trim();
            const price = parseInt($(element).find('span.item-price').text().replace(/[^\d]/g, ''), 10);
            const space = parseInt($(element).find('span.item-detail:contains("m²")').text().replace(/[^\d]/g, ''), 10);
            const numRooms = $(element).find('span.item-detail:contains("hab")').length ? parseInt($(element).find('span.item-detail:contains("hab")').text().replace(/[^\d]/g, ''), 10) : 0;
            const publishDate = $(element).find('span.txt-highlight-red').text().trim();
            const url = 'https://www.idealista.com' + $(element).find('a.item-link').attr('href');
            
            const apartment: Apartment = {
                title,
                description,
                price,
                space,
                numRooms,
                publishDate,
                url
            };

            apartments.push(apartment);
        });

        return apartments;
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        return [];
    }
};
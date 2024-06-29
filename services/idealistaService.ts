import axios from 'axios';
import * as cheerio from 'cheerio';
import { Apartment } from '../models/apartment';
import { URLBuilder } from '../models/URLBuilder';
import fs from 'fs';
import path from 'path';

const baseUrl = 'https://www.idealista.com/areas/alquiler-viviendas/';
const area = '/?shape=%28%28ekbhGbfyb%40s%5C%3FgSiC%7BIiRbBiRzI%7Bi%40q%40se%40uCoT%7BImTkHcAeE%7EMkH%3F%3FqG%7CIoToKrGtCiR%7DI%3Fo%40wIhHiClK_NaBwIyFgCtCsGpNvI%3FePmKal%40uC%7Bi%40%3Fyv%40p%40mE%3Fst%40bBqG%60B%7Di%40fE%7Di%40bBqGjHor%40hHeP%7CW%7BZjHiCzW%3F%60MlEfSvXlKja%40bB%7EMjHdPzItIvQgCfSePng%40en%40jHmE%60%5D%7DZvm%40_%5D%60%5BbAjHhCtQpVbB%60N%3FvXnKbP%3FrGjHbP%3F%60NpNvXvQvg%40%3Frt%40pNdP%3FdPdPbPtCzK%3Fnc%40hHvXvQd_%40lKre%40%3FbP%7CIdPxF%3Fq%40d_%40uCvXoK%7EMuQja%40kHpGkHvXmKpGkHdPci%40cA%7Bb%40sVoYwXwF_Nuj%40c%7B%40gEuIyTsG%7DW%3FuQhCia%40%60%5DgSlTgE%3Fyb%40%60%5D%7DIfC_MdPgE%60%5DqNre%40yFpG%29%29&ordenado-por=fecha-publicacion-desc';
const httpHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'es,es-ES;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
};

const processedURLsPath = path.join(__dirname, 'processedURLs.json');

const loadProcessedURLs = (): Set<string> => {
    try {
        if (fs.existsSync(processedURLsPath)) {
            const data = fs.readFileSync(processedURLsPath, 'utf-8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('Error cargando URLs procesadas:', error);
    }
    return new Set<string>();
};

const saveProcessedURLs = (urls: Set<string>) => {
    try {
        fs.writeFileSync(processedURLsPath, JSON.stringify(Array.from(urls)), 'utf-8');
    } catch (error) {
        console.error('Erros guardando URLs procesadas:', error);
    }
};

const processedURLs = loadProcessedURLs();

interface PublicationResult {
    newApartments: Apartment[];
    currentPublications: string[];
}

export const getPublications = async (options: {
    priceMin?: number,
    priceMax?: number,
    metersMin?: number,
    metersMax?: number,
    publishDate?: string,
    type?: string[],
    numRooms?: string[],
    numBathrooms?: string[],
    conditions?: string[],
    features?: string[]
}): Promise<PublicationResult> => {
    try {
        const urlBuilder = new URLBuilder(baseUrl, area).addFilters(options);
        const url = urlBuilder.build();

        console.log('Cargando el listado de publicaciones...');
        const response = await axios.get(url, {
            headers: httpHeaders
        });

        const $ = cheerio.load(response.data);
        const articles = $('article.item');
        let apartments: Apartment[] = [];
        let currentURLs = new Set<string>();
        let newApartments: Apartment[] = [];

        for (let index = 0; index < articles.length; index++) {
            const element = articles[index];
            const detailUrl = 'https://www.idealista.com' + $(element).find('a.item-link').attr('href');

            currentURLs.add(detailUrl);

            if (processedURLs.has(detailUrl)) {
                continue;
            }

            processedURLs.add(detailUrl);
            console.log(`Cargando detalle para ${detailUrl} ...`)
            const publishDate = $(element).find('span.txt-highlight-red').text().trim();
            const responseDetail = await axios.get(detailUrl, {
                headers: httpHeaders
            });
            const detailPage = cheerio.load(responseDetail.data);

            const title = detailPage('.main-info__title-main').text().trim();
            const description = (detailPage('.comment p').html() ?? '').replace(/<br\s*\/?>/g, '\n').trim();
            const location = detailPage('.main-info__title-minor').text().trim();
            const price = parseInt(detailPage('.price').text().replace(/[^\d]/g, ''), 10);
            const space = parseInt(detailPage('.info-features span:nth-of-type(1)').text().replace(/[^\d]/g, ''), 10);
            const numRooms = parseInt(detailPage('.info-features span:nth-of-type(2)').text().replace(/[^\d]/g, ''), 10);

            const floorDetails = detailPage('.details-property_features ul li').map((i, el) => {
                const text = detailPage(el).text().toLowerCase();
                if (text.includes('planta') || text.includes('exterior') || text.includes('ascensor')) {
                    return text.replace('planta', '').trim();
                }
                return null;
            }).get().filter((item: string | null) => item !== null).join(' ');
            const floor = floorDetails.length > 0 ? floorDetails : 'No especificado';

            const dateUpdated = detailPage('.date-update-text').text().replace('Anuncio actualizado hace ', '').trim();

            const features = detailPage('.details-property_features ul:nth-of-type(1) li').map((i, el) => detailPage(el).text().trim()).get();
            const building = detailPage('.details-property_features ul:nth-of-type(2) li').map((i, el) => detailPage(el).text().trim()).get();

            const energyConsumption = detailPage('.icon-energy-c-e').first().text().trim();
            const energyEmissions = detailPage('.icon-energy-c-e').last().text().trim();

            const refNumber = detailPage('.txt-ref').text().trim();
            const agency = detailPage('.professional-name .name').first().text().trim();
            const agencyLocation = detailPage('.advertiser-name-container span').text().trim();

            const apartment: Apartment = {
                title,
                description,
                price,
                publishDate,
                space,
                numRooms,
                floor,
                dateUpdated,
                location,
                features,
                building,
                energyConsumption,
                energyEmissions,
                refNumber,
                agency,
                agencyLocation,
                url: detailUrl
            };

            apartments.push(apartment);
            newApartments.push(apartment);
        }

        processedURLs.forEach(url => {
            if (!currentURLs.has(url)) {
                processedURLs.delete(url);
            }
        });

        saveProcessedURLs(processedURLs);

        return { newApartments, currentPublications: Array.from(currentURLs) };
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        return { newApartments: [], currentPublications: [] };
    }
};

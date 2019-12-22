import jraResultScraping from '../../main/scraping/jra-result-scraping';
import fs = require('fs');
import * as chai from 'chai';

const test = async() => {
    try {
        const result = await jraResultScraping('2019', '12', '1');
        console.log('OK!');
    } catch (e) {
        console.error(e);
    }
    // console.log(JSON.stringify(result, undefined, 2));
    const expected = fs.readFileSync('./src/test/scraping/expected.json', 'utf8');
    // chai.assert.deepEqual(result, JSON.parse(expected));
    // console.log('OK!');
};

test();

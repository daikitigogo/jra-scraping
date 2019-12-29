import * as dotenv from 'dotenv';
dotenv.config();

import * as modules from '#/modules';
import * as chai from "chai";
import fs = require('fs');
import parse = require('csv-parse/lib/sync');
import * as entities from '#/db/entities';

(async () => {
    try {
        await modules.mainController.run('2019', '02', '17');
        assert<entities.RaceData>('race_data', 'SELECT * FROM race_data', new Set(['date_of_race', 'turf_place_code', 'race_number']));
    } catch (e) {
        console.error(e);
    } finally {
        await modules.close();
    }
})();

async function assert<T>(tableName: string, sql: string, parimary: Set<string>) {

    const expected = parse(fs.readFileSync(`./src/test/expected-${tableName}.csv`), {
        columns: true
    }) as T[];
    const conn = await modules.pool.getConnection();
    const actualData = await modules.dbUtil.select<T>(conn, sql);

    chai.assert.deepEqual(grouping(actualData, parimary), grouping(expected, parimary));
}

function grouping<T>(values: T[], primary: Set<string>) {
    return values.map(v => {
        const key = Object.entries(v).filter(([k]) => primary.has(k)).map(([_, v]) => v.join());
        const result = new WeakMap();
        result.set(key, result);
        return result;
    });
}
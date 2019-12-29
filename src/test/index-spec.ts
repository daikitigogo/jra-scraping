import * as dotenv from 'dotenv';
dotenv.config();

process.env.NODE_DB_DATABASE = 'test';

import * as modules from '#/modules';
import * as chai from "chai";
import fs = require('fs');
import parse = require('csv-parse/lib/sync');
import * as entities from '#/db/entities';
import { logger } from '#/logger';

const sql1 = `
    SELECT
        DATE_FORMAT(date_of_race, '%Y-%m-%d') AS date_of_race,
        turf_place_code,
        race_number,
        race_type,
        weather,
        ground_condition,
        race_distance,
        horse_age,
        race_grade,
        handicap,
        mare_only,
        speciality_race_id,
        race_detail_id,
        refund_id
    FROM
        race_data
    ;
`;

(async () => {
    try {
        await after();
        await before();
        await modules.mainController.run('2019', '02', '17');
        await Promise.all([
            assert<entities.RaceData>('race_data', sql1, new Set(['date_of_race', 'turf_place_code', 'race_number'])),
            assert<entities.RaceDetail>('race_detail', 'SELECT * FROM race_detail;', new Set(['race_detail_id', 'horse_number'])),
            assert<entities.Refund>('refund', 'SELECT * FROM refund;', new Set(['refund_id', 'refund_kind', 'refund_seq'])),
            assert<entities.HorseMaster>('horse_master', 'SELECT * FROM horse_master;', new Set(['horse_id'])),
            assert<entities.SpecialityRace>('speciality_race', 'SELECT * FROM speciality_race;', new Set(['speciality_race_id'])),
        ]);
        await after();
        logger.info('OK!');
    } catch (e) {
        console.error(e);
        await after();
    } finally {
        await modules.close();
    }
})();

async function before() {

    const conn = await modules.pool.getConnection();
    try {
        await conn.query('INSERT INTO horse_master (horse_id, horse_name, birth_year, sex) VALUES (?, ?, ?, ?)', [1, 'レトロロック', '2012', 'M']);
        await conn.query('INSERT INTO horse_master (horse_id, horse_name, birth_year, sex) VALUES (?, ?, ?, ?)', [2, 'マウントゴールド', '2013', 'M']);
        await conn.query('INSERT INTO horse_master (horse_id, horse_name, birth_year, sex) VALUES (?, ?, ?, ?)', [3, 'アメリカズカップ', '2014', 'M']);
        await conn.query('INSERT INTO horse_master (horse_id, horse_name, birth_year, sex) VALUES (?, ?, ?, ?)', [4, 'ドウディ', '2008', 'M']);
    } finally {
        await conn.end();
    }
}

async function after() {

    const conn = await modules.pool.getConnection();
    try {
        await conn.query('TRUNCATE TABLE race_data;');
        await conn.query('TRUNCATE TABLE race_detail;');
        await conn.query('TRUNCATE TABLE refund;');
        await conn.query('TRUNCATE TABLE horse_master;');
        await conn.query('TRUNCATE TABLE speciality_race;');
    } finally {
        await conn.end();
    }
}

async function assert<T>(tableName: string, sql: string, parimary: Set<string>) {

    logger.info(`${tableName} test start!`);
    const conn = await modules.pool.getConnection();

    try {
        const expected = parse(fs.readFileSync(`./src/test/expected-${tableName}.csv`), {
            columns: true
        }) as T[];
        const actualData = await conn.query({ namedPlaceholders: true, sql });
        assertObj(grouping(actualData, parimary), grouping(expected, parimary));
    } finally {
        conn.end();
    }
}

function grouping<T>(values: T[], primary: Set<string>) {
    return values.reduce((a, v) => {
        const key = Object.entries(v).filter(([k, _]) => primary.has(k)).map(([_, v]) => v).join();
        // @ts-ignore
        a[key] = v;
        return a;
    }, {});
}

function assertObj(obj1: any, obj2: any) {

    Object.keys(obj1).forEach(key => {
        logger.info(`key: ${key} ----------`);
        const a = obj1[key];
        const b = obj2[key];
        Object.keys(a).forEach(k => {
            logger.info(`property: ${k} ----------`);
            chai.assert.equal(nullToEmpty(a[k]), nullToEmpty(b[k]));
        });
    });
}

function nullToEmpty(value: any) {
    return value == null ? '' : value;
}

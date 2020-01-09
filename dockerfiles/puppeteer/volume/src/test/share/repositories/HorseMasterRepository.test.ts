import * as dotenv from 'dotenv';
dotenv.config();

import fs = require('fs');
import parse = require('csv-parse/lib/sync');
import { HorseMasterRepository } from '#/share/repositories/PlainRepositories';
import * as mariadb from 'mariadb';
import { HorseMaster } from '#/share/entities';

// test target
const target = new HorseMasterRepository();
// connection pool
const pool = mariadb.createPool({
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_DATABASE,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
});

// test data setup
const setup = async(conn: mariadb.Connection) => {

    await conn.query('TRUNCATE TABLE horse_master');
    const dataList = parse(fs.readFileSync(`./src/test/share/repositories/setup-horse_master.csv`), {
        columns: true
    }) as HorseMaster[];

    for (const data of dataList) {
        await target.insert(conn, data);
    }
};

/** insert ok test1 */
const insertOk1 = async() => {

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        await setup(conn);

        const setupData = new HorseMaster();
        setupData.horseName = 'ブエナビスタ';
        setupData.birthYear = 2006;
        setupData.sex = 'M';

        const writeRsp = await target.insert(conn, setupData);
        expect(writeRsp.insertId).toBe(21);

        const actualData = await target.selectOne(conn, { horseId: 21 });
        expect(actualData).toMatchObject({ horseId: 21, horseName: 'ブエナビスタ', birthYear: 2006, sex: 'M' });
    } finally {
        await conn.rollback();
        await conn.end();
    }
};

// /** update ok test1 */
// const updateOk1 = async() => {

//     const conn = await pool.getConnection();
//     await conn.beginTransaction();

//     try {
//         await setup(conn);

//         const beforeData = await target.selectOne(conn, { horseId: 15 });
//         beforeData.dadHorseName = 'ディープインパクト';
//         beforeData.secondDadHorseName = 'サンデーサイレンス';

//         await target.update(conn, beforeData);
//         const actualData = await target.selectOne(conn, { horseId: 15 });
//         expect(actualData).toMatchObject({ horseId: 15, horseName: 'コルク', birthYear: 2016, sex: 'M', dadHorseName: 'ディープインパクト', secondDadHorseName: 'サンデーサイレンス' });
//     } finally {
//         await conn.rollback();
//         await conn.end();
//     }
// };

// /** select all ok test1 */
// const selectAllOk1 = async() => {

//     const conn = await pool.getConnection();
//     await conn.beginTransaction();

//     try {
//         await setup(conn);

//         const actualData = await target.selectAll(conn);
//         const csvData = parse(fs.readFileSync(`./src/test/share/repositories/setup-horse_master.csv`), {
//             columns: true
//         }) as HorseMaster[];
//         const expecred = csvData.map(d => {
//             const result = {
//                 horseId: Number(d.horseId),
//                 horseName: d.horseName,
//                 birthYear: Number(d.birthYear),
//                 sex: d.sex
//             };
//             d.dadHorseName && Object.assign(result, { dadHorseName: d.dadHorseName });
//             d.secondDadHorseName && Object.assign(result, { secondDadHorseName: d.secondDadHorseName });
//             return result;
//         });

//         console.log(actualData);
//         expect(actualData).toMatchObject(expecred);
//     } finally {
//         await conn.rollback();
//         await conn.end();
//     }
// };

// /** select ok test1 */
// const selectTestOk1 = async() => {

//     const conn = await pool.getConnection();
//     await conn.beginTransaction();

//     try {
//         await setup(conn);

//         const actualData = await target.selectNoReflectParentInfo(conn);
//         const csvData = parse(fs.readFileSync(`./src/test/share/repositories/setup-horse_master.csv`), {
//             columns: true
//         }) as HorseMaster[];
//         const expecred = csvData
//             .filter(d => !d.dadHorseName && !d.secondDadHorseName)
//             .map(d => {
//                 return {
//                     horseId: Number(d.horseId),
//                     horseName: d.horseName,
//                     birthYear: Number(d.birthYear),
//                     sex: d.sex
//                 };
//             });

//         expect(actualData).toMatchObject(expecred);
//     } finally {
//         await conn.rollback();
//         await conn.end();
//     }
// };

// /** select ok test1 */
// const selectTestOk2 = async() => {

//     const conn = await pool.getConnection();
//     await conn.beginTransaction();

//     try {
//         await setup(conn);
//         const actualData = await target.selectOneByHorseNameAndBirthYear(conn, { horseName: 'レトロロック', birthYear: 2012 } as HorseMaster);

//         expect(actualData).toMatchObject({ horseId: 1, horseName: 'レトロロック', birthYear: 2012, sex: 'M' });
//     } finally {
//         await conn.rollback();
//         await conn.end();
//     }
// };

describe('HorseMaster', () => {
    test('insertOk1', insertOk1);
    // test('updateOk1', updateOk1);
    // test('selectAllOk1', selectAllOk1);
    // test('selectTestOk1', selectTestOk1);
    // test('selectTestOk2', selectTestOk2)
});

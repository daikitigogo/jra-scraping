/**
 * 競走馬マスタ登録SQL
 */
const insertHorseMasterSQL = `
    INSERT INTO horse_master (
        horse_id,
        horse_name,
        birthday,
        dad_horse_id,
        second_dad_horse_id,
        third_dad_horse_id
    ) VALUES (
        :horseId,
        :horseName,
        :birthday,
        :dadHorseId,
        :secondDadHorseId,
        :thirdDadHorseId
    );
`;

export default {
    insertHorseMasterSQL,
};
import { BaseRepository } from "./BaseRepository";
import { RaceDetail } from "#/share/entities";

/**
 * race_detailリポジトリ
 */
export class RaceDetailRepository extends BaseRepository<RaceDetail> {

    /** コンストラクタ */
    constructor() {
        super(new RaceDetail());
    }
}
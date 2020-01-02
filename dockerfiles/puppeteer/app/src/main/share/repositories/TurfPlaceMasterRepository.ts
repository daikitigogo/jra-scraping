import { BaseRepository } from "./BaseRepository";
import { TurfPlaceMaster } from "#/share/entities";

/**
 * turf_place_masterリポジトリ
 */
export class TurfPlaceMasterRepository extends BaseRepository<TurfPlaceMaster> {

    /** コンストラクタ */
    constructor() {
        super(new TurfPlaceMaster());
    }
};
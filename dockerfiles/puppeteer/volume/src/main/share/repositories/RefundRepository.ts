import { BaseRepository } from "./BaseRepository";
import { Refund } from "#/share/entities";

/**
 * refundリポジトリ
 */
export class RefundRepository extends BaseRepository<Refund> {

    /** コンストラクタ */
    constructor() {
        super(new Refund());
    }
}
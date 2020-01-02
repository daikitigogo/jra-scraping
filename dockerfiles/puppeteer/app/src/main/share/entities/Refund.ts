import { BaseEntity } from "./BaseEntity";

/**
 * refundエンティティ
 */
 export class Refund implements BaseEntity {

    /** テーブル名 */
    readonly tableName = 'refund';
    /** 主キーセット */
    readonly primaryKeySet = new Set(['refund_id', 'refund_kind', 'refund_seq']);

    /** 払戻ID */
    refundId: number = null;
    /** 払戻種別 */
    refundKind: string = null;
    /** 払戻連番 */
    refundSeq: number = null;
    /** 当選番号1 */
    firstNumber: number = null;
    /** 当選番号2 */
    secondNumber: number = null;
    /** 当選番号3 */
    thirdNumber: number = null;
    /** 払戻金額 */
    refundAmount: number = null;
    /** 払戻人気 */
    refundPop: number = null;
};

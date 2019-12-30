/**
 * refundエンティティ
 */
 export class Refund {
    /** 払戻ID */
    refundId: number;
    /** 払戻種別 */
    refundKind: string;
    /** 払戻連番 */
    refundSeq: number;
    /** 当選番号1 */
    firstNumber: number;
    /** 当選番号2 */
    secondNumber: number;
    /** 当選番号3 */
    thirdNumber: number;
    /** 払戻金額 */
    refundAmount: number;
    /** 払戻人気 */
    refundPop: number;
};

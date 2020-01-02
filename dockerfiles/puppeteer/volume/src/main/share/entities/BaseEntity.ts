/**
 * ベースエンティティ
 */
export interface BaseEntity {
    /** テーブル名 */
    readonly tableName: string;
    /** 主キーセット */
    readonly primaryKeySet: Set<string>;
}
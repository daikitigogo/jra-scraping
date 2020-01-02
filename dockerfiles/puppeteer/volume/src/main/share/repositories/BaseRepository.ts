import { Connection } from 'mariadb';
import { BaseEntity } from '../entities/BaseEntity';
import { logger } from '#/logger';

/**
 * 書き込みレスポンス
 */
export class WriteResponse {
    readonly affectedRows: 1;
    readonly insertId: 1;
    readonly warningStatus: 0;
};

/**
 * DBアクセスクラス
 */
export abstract class BaseRepository<T extends BaseEntity> {

    /** 全件検索SQL */
    private readonly selectAllSQL: string;
    /** 主キー検索SQL */
    private readonly selectOneSQL: string;
    /** インサートSQL */
    private readonly insertSQL: string;
    /** アップデートSQL */
    private readonly updateSQL: string;

    /** コンストラクタ　(各種基本のSQLを生成する) */
    constructor(instance: T) {
        this.selectAllSQL = this.createSelectAllSql(instance);
        this.selectOneSQL = this.createSelectOneSql(instance);
        this.insertSQL = this.createInsertSql(instance);
        this.updateSQL = this.createUpdateSql(instance);
    }

    /**
     * 全件検索
     * @param conn {Connection}
     * @returns {Promise<Array<T>>}
     */
    async selectAll(conn: Connection): Promise<Array<T>> {
        logger.debug(`call selectAll. sql: ${this.selectAllSQL}`);
        const results: any[] = await this.query(conn, this.selectAllSQL);
        return results.map(this.snakeToCamelObj);
    }

    /**
     * sqlを省略した場合は主キー検索    
     * 任意の条件で検索したい場合はsqlを指定する    
     * 戻り値は先頭１件しか返さない
     * @param conn {Connection}
     * @param entity {T}
     * @param sql? {string}
     * @returns {Promise<T>}
     */
    async selectOne(conn: Connection, entity: T, sql?: string): Promise<T> {
        const query = sql || this.selectOneSQL;
        logger.debug(`call selectOne. sql: ${query}`);
        logger.debug(`entity: ${JSON.stringify(entity)}`);
        const results: any[] = await this.query(conn, query, entity);
        return results.length > 0 ? this.snakeToCamelObj(results[0]) : {} as T;
    }

    /**
     * sqlは省略不可    
     * 任意の条件のsqlを指定する    
     * 戻り値は全件返す
     * @param conn {Connection}
     * @param entity {T}
     * @param sql {string}
     * @returns {Promise<Array<T>>}
     */
    async select(conn: Connection, entity: T, sql: string): Promise<Array<T>> {
        logger.debug(`call select. sql: ${sql}`);
        logger.debug(`entity: ${JSON.stringify(entity)}`);
        const results: any[] = await this.query(conn, sql, entity);
        return results.map(this.snakeToCamelObj);
    }

    /**
     * sqlを省略した場合は全カラム対象のインサート    
     * カラムを指定したい場合はsqlを指定する
     * @param conn {Connection}
     * @param entity {T}
     * @param sql? {string}
     * @returns {Promise<WriteResponse>}
     */
    async insert(conn: Connection, entity: T, sql?: string): Promise<WriteResponse> {
        const query = sql || this.insertSQL;
        logger.debug(`call insert. sql: ${query}`);
        logger.debug(`entity: ${JSON.stringify(entity)}`);
        return await this.query(conn, query, entity);
    }

    /**
     * sqlを省略した場合は主キー指定でのアップデート
     * アップデート条件を指定したい場合はsqlを指定する
     * @param conn {Connection}
     * @param entity {T}
     * @param sql? {string}
     * @returns {Promise<WriteResponse>}
     */
    async update(conn: Connection, entity: T, sql?: string): Promise<WriteResponse> {
        const query = sql || this.updateSQL;
        logger.debug(`call update. sql: ${query}`);
        logger.debug(`entity: ${JSON.stringify(entity)}`);
        return await this.query(conn, query, entity);
    }

    /**
     * QUERY
     * @param conn {Connection}
     * @param sql {string}
     * @param entity? {T}
     * @returns {Promise<any>}
     */
    private async query(conn: Connection, sql: string, entity?: T): Promise<any> {
        return await conn.query({ namedPlaceholders: true, sql }, entity);
    }

    /**
     * スネークケースをキャメルケースに変換
     * @param snake {any}
     * @returns {T}
     */
    protected snakeToCamelObj(snakeObj: any): T {
        return Object.entries(snakeObj)
            .reduce((a, [k, v]: [string, any]) => {
                const camelKey = k.replace(/(_)(.)/g, (_1, _2, p2: string) => p2.toUpperCase());
                // @ts-ignore
                a[camelKey] = v;
                return a;
            }, {}) as T;
    }

    /**
     * キャメルケースをスネークケースに変換
     * @param camelKey {string}
     */
    protected camelToSnake(camelKey: string): string {
        return camelKey.replace(/[A-Z0-9]/g, matched => '_' + matched.toLowerCase());
    }

    /**
     * エンティティからカラム配列を取得する
     * @param instance T
     */
    protected getColumns(instance: T): string[] {
        return Object.keys(instance)
            .filter(k => k != 'tableName' && k != 'primaryKeySet');
    }

    /**
     * 全検索SQLを生成する
     * @param instance インスタンス
     */
    private createSelectAllSql(instance: T) {
        const snakeKeys = this.getColumns(instance).map(this.camelToSnake);
        return `
            SELECT
                ${snakeKeys.join(', ')}
            FROM
                ${instance.tableName}
            ORDER BY
                ${Array.from(instance.primaryKeySet).join(', ')}
            ;
        `;
    }

    /**
     * 主キー検索SQLを生成する
     * @param instance インスタンス
     */
    private createSelectOneSql(instance: T) {
        const snakeKeys = this.getColumns(instance).map(this.camelToSnake);
        const primaries = this.getColumns(instance)
            .filter(k => instance.primaryKeySet.has(k))
            .map(k => `${this.camelToSnake(k)} = :${k}`);
        return `
            SELECT
                ${snakeKeys.join(', ')}
            FROM
                ${instance.tableName}
            WHERE
                ${primaries.join(' AND ')}
            ORDER BY
                ${Array.from(instance.primaryKeySet).join(', ')}
            ;
        `;
    }

    /**
     * インサートSQLを生成する
     * @param instance インスタンス
     */
    private createInsertSql(instance: T) {
        const camelKeys = this.getColumns(instance);
        const snakeKeys = camelKeys.map(this.camelToSnake);
        return `
            INSERT INTO ${instance.tableName} (
                ${snakeKeys.join(', ')}
            ) VALUES (
                ${camelKeys.map(k => ':' + k).join(', ')}
            );
        `;
    }

    /**
     * アップデートSQLを生成する
     * @param instance インスタンス
     */
    private createUpdateSql(instance: T) {
        const updates = this.getColumns(instance)
            .filter(k => !instance.primaryKeySet.has(k))
            .map(k => `${this.camelToSnake(k)} = :${k}`);
        const primaries = this.getColumns(instance)
            .filter(k => instance.primaryKeySet.has(k))
            .map(k => `${this.camelToSnake(k)} = :${k}`);
        return `
            UPDATE
                ${instance.tableName}
            SET
                ${updates.join(', ')}
            WHERE
                ${primaries.join(' AND ')}
            ;
        `;
    }
};

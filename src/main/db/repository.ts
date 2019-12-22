import * as mariadb from 'mariadb';

/**
 * DB接続情報
 */
const config: mariadb.PoolConfig = {
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_DATABASE,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    connectionLimit: 1
};

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
export class Repository {

    /** コネクションプール */
    private pool: mariadb.Pool;

    /** コンストラクタ */
    constructor() {
        this.pool = mariadb.createPool(config);
    }

    /**
     * SELECT
     * @param sql string
     * @param values any
     * @returns Promise<T>
     */
    async select<T>(sql: string, values?: any): Promise<Array<T>> {
        const results: any[] = await this.query(sql, values);
        return results.map(r => this.snakeToCamel(r));
    }

    /**
     * INSERT, UPDATE
     * @param sql string
     * @param values any
     * @returns Promise<WriteResponse>
     */
    async write(sql: string, values?: any): Promise<WriteResponse> {
        return this.query(sql, values);
    }

    /**
     * コネクションプールEND
     */
    end() {
        this.pool && this.pool.end();
    }

    /**
     * QUERY
     * @param sql string
     * @param values any
     * @returns Promise<any>
     */
    private async query(sql: string, values?: any): Promise<any> {
        let conn: mariadb.PoolConnection;
        try {
            conn = await this.pool.getConnection();
            return await conn.query({ namedPlaceholders: true, sql }, values);
        } finally {
            conn && conn.end();
        }
    }

    /**
     * スネークケースをキャメルケースに変換
     * @param snake any
     * @returns any
     */
    private snakeToCamel(snakeObj: any): any {
        const result = {};
        for (const [k, v] of Object.entries(snakeObj)) {
            const splited = k.split('_');
            const camelKey = splited.reduce((accum, cur, i) => {
                if (i == 0) return cur;
                return accum + cur.charAt(0).toUpperCase() + cur.slice(1);
            }, '');
            result[camelKey] = v;
        }
        return result;
    }
};

import * as mariadb from 'mariadb';

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
export class DbUtil {

    /**
     * SELECT
     * @param sql string
     * @param values any
     * @returns Promise<T>
     */
    async selectOne<T>(conn: mariadb.Connection, sql: string, values?: any): Promise<T> {
        const results: any[] = await this.query(conn, sql, values);
        return results.length > 0 ? this.snakeToCamel(results[0]) : {} as T;
    }

    /**
     * SELECT
     * @param sql string
     * @param values any
     * @returns Promise<T>
     */
    async select<T>(conn: mariadb.Connection, sql: string, values?: any): Promise<Array<T>> {
        const results: any[] = await this.query(conn, sql, values);
        return results.map(this.snakeToCamel);
    }

    /**
     * INSERT, UPDATE
     * @param sql string
     * @param values any
     * @returns Promise<WriteResponse>
     */
    async write(conn: mariadb.Connection, sql: string, values?: any): Promise<WriteResponse> {
        return await this.query(conn, sql, values);
    }

    /**
     * QUERY
     * @param sql string
     * @param values any
     * @returns Promise<any>
     */
    private async query(conn: mariadb.Connection, sql: string, values?: any): Promise<any> {
        return await conn.query({ namedPlaceholders: true, sql }, values);
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
            // @ts-ignore
            result[camelKey] = v;
        }
        return result;
    }
};

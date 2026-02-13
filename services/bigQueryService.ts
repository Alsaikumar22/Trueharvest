
import type { Verse } from '../types';

interface BigQueryConfig {
    projectId: string;
    datasetId: string;
    tableId: string;
    accessToken: string;
}

let bqConfig: BigQueryConfig | null = null;

export const setBigQueryConfig = (config: BigQueryConfig) => {
    bqConfig = config;
    sessionStorage.setItem('trueHarvestBQConfig', JSON.stringify(config));
};

export const getBigQueryConfig = (): BigQueryConfig | null => {
    if (bqConfig) return bqConfig;
    const stored = sessionStorage.getItem('trueHarvestBQConfig');
    if (stored) {
        bqConfig = JSON.parse(stored);
        return bqConfig;
    }
    return null;
};

export const clearBigQueryConfig = () => {
    bqConfig = null;
    sessionStorage.removeItem('trueHarvestBQConfig');
};

export const fetchChapterFromBigQuery = async (
    language: string, 
    book: string, 
    chapter: number
): Promise<Verse | null> => {
    const config = getBigQueryConfig();
    if (!config) return null;

    const query = `
        SELECT verse, text 
        FROM \`${config.projectId}.${config.datasetId}.${config.tableId}\`
        WHERE LOWER(language) = '${language.toLowerCase()}' 
        AND LOWER(book) = '${book.toLowerCase()}' 
        AND chapter = ${chapter}
        ORDER BY verse ASC
        LIMIT 300
    `;

    try {
        const response = await fetch(
            `https://bigquery.googleapis.com/bigquery/v2/projects/${config.projectId}/queries`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    useLegacySql: false
                })
            }
        );

        if (!response.ok) {
            // Clone response to avoid disturbing the body for other readers/handlers
            const err = await response.clone().json().catch(() => ({ error: { message: response.statusText } }));
            console.error("BigQuery API Error:", err);
            throw new Error(err.error?.message || "Failed to query BigQuery");
        }

        const data = await response.json();
        
        if (!data.rows) return null; // No rows found

        const verseMap: Verse = {};
        
        // BigQuery API returns rows as { f: [ {v: val}, {v: val} ] }
        // We assume order: verse (index 0), text (index 1) based on SELECT statement
        data.rows.forEach((row: any) => {
            const verseNum = parseInt(row.f[0].v);
            const text = row.f[1].v;
            if (verseNum && text) {
                verseMap[verseNum] = text;
            }
        });

        return Object.keys(verseMap).length > 0 ? verseMap : null;

    } catch (error) {
        console.error("BigQuery Fetch Error:", error);
        return null;
    }
};

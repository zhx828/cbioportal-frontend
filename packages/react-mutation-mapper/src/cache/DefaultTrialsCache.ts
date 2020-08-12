import request from 'superagent';

import { DefaultStringQueryCache } from './DefaultStringQueryCache';

export class DefaultTrialsCache extends DefaultStringQueryCache<any> {
    public async fetch(query: string) {
        const trialsRecords = await new Promise<any>((resolve, reject) => {
            const url = 'https://test.oncokb.org/trials/cancerTypes';
            request
                .post(url)
                .set('Content-Type', 'application/json')
                .send({ cancerTypes: query })
                .end((err, res) => {
                    if (!err && res.ok) {
                        const response = JSON.parse(res.text);
                        const ret: any = {};
                        resolve(ret);
                    } else {
                        reject(err);
                    }
                });
        });

        return trialsRecords[query];
    }
}

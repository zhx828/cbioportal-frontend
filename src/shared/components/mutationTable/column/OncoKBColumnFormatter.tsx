import * as React from 'react';
import {
    OncoKBColumn,
    OncoKBColumnProps,
    oncoKBColumnSortValue,
    getOncoKBColumnData,
    IOncoKBColumn,
    oncoKbAnnotationDownload,
} from 'react-mutation-mapper';
import { IOncoKbData, RemoteData } from 'cbioportal-utils';
import OncokbPubMedCache from 'shared/cache/PubMedCache';
import OncokbTrailsCache from 'shared/cache/ClinicalTrialsCache';
import { CancerStudy, Mutation } from 'cbioportal-ts-api-client';
import { CancerGene } from 'oncokb-ts-api-client';

export interface IOncoKBColumnProps extends OncoKBColumnProps {
    pubMedCache?: OncokbPubMedCache;
    trialsCache?: OncokbTrailsCache;
    studyIdToStudy?: { [studyId: string]: CancerStudy };
    uniqueSampleKeyToTumorType?: { [sampleId: string]: string };
}

export default class OncoKBColumnFormatter {
    public static sortValue(
        data: Mutation[],
        oncoKbCancerGenes?: RemoteData<CancerGene[] | Error | undefined>,
        oncoKbData?: RemoteData<IOncoKbData | Error | undefined>,
        usingPublicOncoKbInstance?: boolean,
        resolveTumorType?: (mutation: Mutation) => string
    ): number[] {
        const annotationData: IOncoKBColumn = getOncoKBColumnData(
            data ? data[0] : undefined,
            oncoKbCancerGenes,
            oncoKbData,
            usingPublicOncoKbInstance,
            resolveTumorType
        );

        return oncoKBColumnSortValue(annotationData);
    }

    public static download(
        data: Mutation[] | undefined,
        oncoKbCancerGenes?: RemoteData<CancerGene[] | Error | undefined>,
        oncoKbData?: RemoteData<IOncoKbData | Error | undefined>,
        usingPublicOncoKbInstance?: boolean,
        resolveTumorType?: (mutation: Mutation) => string
    ) {
        const annotationData: IOncoKBColumn = getOncoKBColumnData(
            data ? data[0] : undefined,
            oncoKbCancerGenes,
            oncoKbData,
            usingPublicOncoKbInstance,
            resolveTumorType
        );

        return [
            `OncoKB: ${oncoKbAnnotationDownload(
                annotationData.oncoKbIndicator
            )}`,
        ].join(';');
    }

    public static renderFunction(
        data: Mutation[],
        columnProps: IOncoKBColumnProps
    ) {
        return (
            <OncoKBColumn
                mutation={data ? data[0] : undefined}
                {...columnProps}
            />
        );
    }
}

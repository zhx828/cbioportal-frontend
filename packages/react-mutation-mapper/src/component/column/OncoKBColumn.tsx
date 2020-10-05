import { IOncoKbData, MobxCache, Mutation, RemoteData } from 'cbioportal-utils';
import { CancerGene, IndicatorQueryResp } from 'oncokb-ts-api-client';
import _ from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';

import { getIndicatorData } from '../../util/OncoKbUtils';
import { defaultArraySortMethod } from '../../util/ReactTableUtils';
import OncoKB, { sortValue as oncoKbSortValue } from '../oncokb/OncoKB';
import ClinicalTrialsCard from '../ClinicalTrials/ClinicalTrialsCard';
import { USE_DEFAULT_PUBLIC_INSTANCE_FOR_ONCOKB } from '../../util/DataFetcherUtils';

export type OncoKBColumnProps = {
    mutation?: Mutation;
    enableOncoKb: boolean;
    enableClinicalTrials: boolean;
    oncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    oncoKbCancerGenes?: RemoteData<CancerGene[] | Error | undefined>;
    usingPublicOncoKbInstance: boolean;
    pubMedCache?: MobxCache;
    trialsCache?: MobxCache;
    resolveEntrezGeneId?: (mutation: Mutation) => number;
    resolveTumorType?: (mutation: Mutation) => string;
    userEmailAddress?: string;
};

export type GenericOncoKBColumnProps = {
    annotation: IOncoKBColumn;
    enableOncoKb: boolean;
    enableClinicalTrials: boolean;
    pubMedCache?: MobxCache;
    trialsCache?: MobxCache;
    userEmailAddress?: string;
};

export interface IOncoKBColumn {
    oncoKbIndicator?: IndicatorQueryResp;
    oncoKbStatus: 'pending' | 'error' | 'complete';
    oncoKbGeneExist: boolean;
    isOncoKbCancerGene: boolean;
    usingPublicOncoKbInstance: boolean;
    hugoGeneSymbol: string;
}

export const DEFAULT_ONCOKBCOLUMN_DATA: IOncoKBColumn = {
    oncoKbStatus: 'complete',
    oncoKbGeneExist: false,
    isOncoKbCancerGene: false,
    usingPublicOncoKbInstance: false,
    hugoGeneSymbol: '',
};

function getDefaultEntrezGeneId(mutation: Mutation): number {
    return (mutation.gene && mutation.gene.entrezGeneId) || 0;
}

function getDefaultTumorType(): string {
    return 'Unknown';
}

export function getOncoKBColumnData(
    mutation?: Mutation,
    oncoKbCancerGenes?: RemoteData<CancerGene[] | Error | undefined>,
    oncoKbData?: RemoteData<IOncoKbData | Error | undefined>,
    usingPublicOncoKbInstance?: boolean,
    resolveTumorType: (mutation: Mutation) => string = getDefaultTumorType,
    resolveEntrezGeneId: (mutation: Mutation) => number = getDefaultEntrezGeneId
): IOncoKBColumn {
    let value: Partial<IOncoKBColumn>;

    if (mutation) {
        const entrezGeneId = resolveEntrezGeneId(mutation);

        let oncoKbIndicator: IndicatorQueryResp | undefined;
        const hugoGeneSymbol = mutation.gene
            ? mutation.gene.hugoGeneSymbol
            : undefined;

        let oncoKbGeneExist = false;
        let isOncoKbCancerGene = false;
        if (oncoKbCancerGenes && !(oncoKbCancerGenes.result instanceof Error)) {
            oncoKbGeneExist =
                _.find(
                    oncoKbCancerGenes.result,
                    (gene: CancerGene) =>
                        gene.oncokbAnnotated &&
                        gene.entrezGeneId === entrezGeneId
                ) !== undefined;
            isOncoKbCancerGene =
                _.find(
                    oncoKbCancerGenes.result,
                    (gene: CancerGene) => gene.entrezGeneId === entrezGeneId
                ) !== undefined;
        }

        value = {
            hugoGeneSymbol,
            oncoKbGeneExist,
            isOncoKbCancerGene,
            usingPublicOncoKbInstance: usingPublicOncoKbInstance
                ? usingPublicOncoKbInstance
                : USE_DEFAULT_PUBLIC_INSTANCE_FOR_ONCOKB,
        };

        // oncoKbData may exist but it might be an instance of Error, in that case we flag the status as error
        if (oncoKbData && oncoKbData.result instanceof Error) {
            value = {
                ...value,
                oncoKbStatus: 'error',
                oncoKbIndicator: undefined,
            };
        } else if (oncoKbGeneExist) {
            // actually, oncoKbData.result shouldn't be an instance of Error in this case (we already check it above),
            // but we need to check it again in order to avoid TS errors/warnings
            if (
                oncoKbData &&
                oncoKbData.result &&
                !(oncoKbData.result instanceof Error) &&
                oncoKbData.status === 'complete'
            ) {
                oncoKbIndicator = getIndicatorData(
                    mutation,
                    oncoKbData.result,
                    resolveTumorType,
                    resolveEntrezGeneId
                );
            }

            value = {
                ...value,
                oncoKbStatus: oncoKbData ? oncoKbData.status : 'pending',
                oncoKbIndicator,
            };
        } else {
            value = {
                ...value,
                oncoKbStatus: 'complete',
                oncoKbIndicator: undefined,
            };
        }
    } else {
        value = DEFAULT_ONCOKBCOLUMN_DATA;
    }

    return value as IOncoKBColumn;
}

export function OncoKBColumnSortMethod(a: IOncoKBColumn, b: IOncoKBColumn) {
    return defaultArraySortMethod(sortValue(a), sortValue(b));
}

export function sortValue(annotation: IOncoKBColumn): number[] {
    return _.flatten([
        oncoKbSortValue(annotation.oncoKbIndicator),
        annotation.isOncoKbCancerGene ? 1 : 0,
    ]);
}

export function GenericOncoKBColumn(
    props: GenericOncoKBColumnProps
): JSX.Element {
    const {
        annotation,
        enableOncoKb,
        enableClinicalTrials,
        pubMedCache,
        trialsCache,
        userEmailAddress,
    } = props;

    return (
        <span style={{ display: 'flex', minWidth: 100 }}>
            {enableOncoKb && (
                <OncoKB
                    usingPublicOncoKbInstance={
                        annotation.usingPublicOncoKbInstance
                    }
                    hugoGeneSymbol={annotation.hugoGeneSymbol}
                    geneNotExist={!annotation.oncoKbGeneExist}
                    isCancerGene={annotation.isOncoKbCancerGene}
                    status={annotation.oncoKbStatus}
                    indicator={annotation.oncoKbIndicator}
                    pubMedCache={pubMedCache}
                    userEmailAddress={userEmailAddress}
                />
            )}
            {enableClinicalTrials &&
                enableOncoKb &&
                annotation.oncoKbGeneExist &&
                annotation.isOncoKbCancerGene && (
                    <ClinicalTrialsCard
                        hugoGeneSymbol={annotation.hugoGeneSymbol}
                        status={annotation.oncoKbStatus}
                        hideClosedTrials={true}
                        indicator={annotation.oncoKbIndicator}
                        trialsCache={trialsCache}
                    />
                )}
        </span>
    );
}

@observer
export default class OncoKBColumn extends React.Component<
    OncoKBColumnProps,
    {}
> {
    public render() {
        const annotation = this.getOncoKBColumnData(this.props);

        return <GenericOncoKBColumn {...this.props} annotation={annotation} />;
    }

    private getOncoKBColumnData(props: OncoKBColumnProps) {
        const {
            mutation,
            oncoKbCancerGenes,
            oncoKbData,
            usingPublicOncoKbInstance,
            resolveEntrezGeneId,
            resolveTumorType,
        } = props;

        return getOncoKBColumnData(
            mutation,
            oncoKbCancerGenes,
            oncoKbData,
            usingPublicOncoKbInstance,
            resolveTumorType,
            resolveEntrezGeneId
        );
    }
}

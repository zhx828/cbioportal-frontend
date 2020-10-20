import React from 'react';
import SummaryWithRefs from '../SummaryWithRefs';
import ReferenceList from '../ReferenceList';
import { If, Then, Else } from 'react-if';
import { ICache } from '../../../model/SimpleCache';
import { Citations } from 'oncokb-ts-api-client';

export const BiologicalContent: React.FunctionComponent<{
    biologicalSummary: string;
    mutationEffectCitations: Citations;
    pmidData: ICache;
}> = props => {
    return (
        <If
            condition={
                props.biologicalSummary !== undefined &&
                props.biologicalSummary.length > 0
            }
        >
            <Then>
                <SummaryWithRefs
                    content={props.biologicalSummary}
                    type={'tooltip'}
                    pmidData={props.pmidData!}
                />
            </Then>
            <Else>
                <If
                    condition={
                        props.mutationEffectCitations &&
                        (props.mutationEffectCitations.abstracts.length > 0 ||
                            props.mutationEffectCitations.pmids.length > 0)
                    }
                >
                    <Then>
                        <ReferenceList
                            pmidData={props.pmidData}
                            pmids={props.mutationEffectCitations!.pmids.map(
                                pmid => Number(pmid)
                            )}
                            abstracts={props.mutationEffectCitations!.abstracts}
                        />
                    </Then>
                    <Else>Mutation effect information is not available.</Else>
                </If>
            </Else>
        </If>
    );
};

import * as React from "react";
import styles from "../table/tables.module.scss";
import {getOncoKbImage} from "../../../shared/components/tracks/OncoKbTrack";
import {If, Then, Else} from 'react-if';

const ONCOKB_URL = "https://oncokb.org";

export function getOncoKBTableHeaderTooltip() {
    return <span>The gene is in <a href={`${ONCOKB_URL}/cancerGenes`} target="_blank">OncoKB Cancer Gene List</a></span>;
}

export function getOncoKBReferenceInfo(hugoGeneSymbol: string, isCancerGene: boolean, oncokbAnnotated: boolean, isOncogene: boolean, isTSG: boolean): JSX.Element | undefined {
    if (isCancerGene) {
        let content = '';

        if (isOncogene || isTSG) {
            content = ' as a ';
            let subContent = [];
            if (isOncogene) {
                subContent.push('oncogene');
            }
            if (isTSG) {
                subContent.push('tumor suppressor gene');
            }
            content = `${content} ${subContent.join(' and ')}`;
        }
        return <span>
            <If condition={oncokbAnnotated}>
                <Then>
                    <a href={`${ONCOKB_URL}/gene/${hugoGeneSymbol}`} target="_blank" style={{marginLeft: 5}}>
                        {hugoGeneSymbol}
                    </a>
                </Then>
                <Else>
                    <span>{hugoGeneSymbol}</span>
                </Else>
            </If>
            <span> is included in the </span>
            {getOncoKBCancerGeneListLinkout()}
            {(isOncogene || isTSG) && (
                <span>{content}</span>
            )}
            .
        </span>
    }
    return undefined;
}

export function getOncoKBTableColumnSortBy(isCancerGene: boolean, frequency: number) {
    return (isCancerGene ? 1 : 0) + frequency / 100
}

export function getOncoKBCancerGeneListLinkout() {
    return <a href={`${ONCOKB_URL}/cancerGenes`} target="_blank">OncoKB Cancer Gene List</a>;
}

export function getOncoKBTableColumnFilter(isCancerGene: boolean, filterStringUpper: string) {
    return filterStringUpper === 'YES' && isCancerGene || filterStringUpper === 'NO' && !isCancerGene;
}
import * as React from "react";
import styles from "../table/tables.module.scss";
import {getOncoKbImage} from "../../../shared/components/tracks/OncoKbTrack";

const ONCOKB_URL = "https://oncokb.org";
export function getOncoKBTableHeaderIcon() {
    return <span className={styles.cancerGenesHeader}>{getOncoKbImage('oncogenic-black')}</span>
}

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
            <span>{hugoGeneSymbol} is included in the </span>
            <a href={`${ONCOKB_URL}/cancerGenes`} target="_blank"> OncoKB Cancer Gene List</a>
            {(isOncogene || isTSG) && (
                <span>{content}</span>
            )}
            {oncokbAnnotated && (
                <a href={`${ONCOKB_URL}/gene/${hugoGeneSymbol}`} target="_blank" style={{marginLeft: 5}}><i
                    className="fa fa-external-link"></i></a>
            )}
            .
        </span>
    }
    return undefined;
}

export function getOncoKBTableColumnSortBy(isCancerGene: boolean, frequency: number) {
    return (isCancerGene ? 1 : 0) + frequency / 100
}

export function getOncoKBTableColumnFilter(isCancerGene: boolean, filterStringUpper: string) {
    return filterStringUpper === 'YES' && isCancerGene || filterStringUpper === 'NO' && !isCancerGene;
}
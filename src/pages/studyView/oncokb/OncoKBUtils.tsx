import * as React from "react";
import styles from "../table/tables.module.scss";
import {getOncoKbImage} from "../../../shared/components/tracks/OncoKbTrack";

export function getOncoKBTableHeaderIcon() {
    return <span className={styles.cancerGenesHeader}>{getOncoKbImage('oncogenic-black')}</span>
}

export function getOncoKBTableHeaderTooltip() {
    return <span>The gene is in <a href="https://oncokb.org/cancerGenes" target="_blank">OncoKB Cancer Gene List</a></span>;
}

export function getOncoKBTableColumnSortBy(isCancerGene: boolean, frequency: number) {
    return (isCancerGene ? 1 : 0) + frequency / 100
}

export function getOncoKBTableColumnFilter(isCancerGene: boolean, filterStringUpper: string) {
    return filterStringUpper === 'YES' && isCancerGene || filterStringUpper === 'NO' && !isCancerGene;
}
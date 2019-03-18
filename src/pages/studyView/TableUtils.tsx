import * as React from 'react';
import * as _ from "lodash";
import {getOncoKBReferenceInfo} from "./oncokb/OncoKBUtils";
import {getQValue} from "./StudyViewUtils";
import styles from "./table/tables.module.scss";
import classnames from 'classnames';
import DefaultTooltip from "../../shared/components/defaultTooltip/DefaultTooltip";
import {If} from 'react-if';

export function getGeneColumnTooltip() {
    return (
        <span>Click to sort by
            <ol style={{paddingLeft: 20}}>
                <li>Cancer Gene</li>
                <li>Frequency</li>
                <li>Hugo gene symbol</li>
            </ol>
        </span>
    )
}

export function getGeneColumnCellOverlay(hugoGeneSymbol: string, geneIsSelected: boolean, isCancerGene: boolean, oncokbAnnotated: boolean, isOncogene: boolean, isTSG: boolean) {
    let content = [
        <span style={{fontSize: 13}}>
            {`Click ${hugoGeneSymbol} to ${geneIsSelected ? 'remove from' : 'add to'} your query`}
        </span>
    ];
    if (isCancerGene) {
        content.push(
            <span style={{fontStyle: 'italic'}}>
                {getOncoKBReferenceInfo(hugoGeneSymbol, isCancerGene, oncokbAnnotated, isOncogene, isTSG)}
            </span>
        );
    }
    return <div style={{display: 'flex', flexDirection: 'column', maxWidth: 300, fontSize: 12}}>{content}</div>;
}

export function getGeneColumnAscSortBy(isCancerGene: boolean, frequency: number, hugoGeneSymbol: string) {
    return [isCancerGene ? '0' : '1', (100 - frequency).toString(), hugoGeneSymbol];
}

export function getGeneColumnRender(tableType: 'mutation' | 'cna', selectedGenes:string[], hugoGeneSymbol: string, qValue: number, isCancerGene: boolean, oncokbAnnotated: boolean, isOncogene: boolean, isTSG: boolean, onGeneSelect: (hugoGeneSymbol: string) => void) {
    const geneIsSelected = _.includes(selectedGenes, hugoGeneSymbol);
    const qvalTypeName = tableType === 'mutation' ? 'MutSig' : 'Gistic';
    const qvalType = qvalTypeName.toLowerCase();
    const qvalOverlay = () =>
        <div><b>{qvalTypeName}</b><br/><i>Q-value: </i><span>{getQValue(qValue)}</span></div>;
    return (
        <div className={classnames(styles.displayFlex)}>
            <DefaultTooltip
                placement="left"
                overlay={getGeneColumnCellOverlay(hugoGeneSymbol, geneIsSelected, isCancerGene, oncokbAnnotated, isOncogene, isTSG)}
                destroyTooltipOnHide={true}
            >
                <span
                    className={classnames(styles.geneSymbol, styles.ellipsisText, isCancerGene ? styles.cancerGene : undefined, _.isUndefined(qValue) ? undefined : styles.shortenText)}
                    onClick={() => onGeneSelect(hugoGeneSymbol)}>
                    {hugoGeneSymbol}
                </span>
            </DefaultTooltip>
            <If condition={!_.isUndefined(qValue)}>
                <DefaultTooltip
                    placement="right"
                    overlay={qvalOverlay}
                    destroyTooltipOnHide={true}
                >
                    <span>
                        <img src={require(`./table/images/${qvalType}.png`)} className={styles[qvalType]}></img>
                    </span>
                </DefaultTooltip>
            </If>
            <If condition={geneIsSelected}>
                <i className='fa fa-check-square-o' style={{marginLeft: 5}}></i>
            </If>
        </div>
    )
}
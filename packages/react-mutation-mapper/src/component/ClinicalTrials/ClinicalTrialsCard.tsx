import autobind from 'autobind-decorator';
import { DefaultTooltip, ICache } from 'cbioportal-frontend-commons';
import {
    IndicatorQueryResp,
    Query,
    IndicatorQueryTreatment,
} from 'oncokb-ts-api-client';

import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import styles from './styles.module.scss';
import { MobxCache } from 'cbioportal-utils';
import { IMatchedTrials, ITrial } from '../../model/ClinicalTrial';
import ClinicalTrialsTable from './ClinicalTrialTable';
import { errorIcon, loaderIcon } from '../StatusHelpers';
import {
    hideArrow,
    isActiveTrial,
    matchTrials,
    classifiedByStatus,
} from './ClinicalTrialsUtil';
import { levelIconClassNames, normalizeLevel } from '../../util/OncoKbUtils';
import { TreatmentTag } from './TreatmentTag';
import oncoKbLogoImgSrc from '../../images/oncokb_logo.png';
import clinicalTrailLogoImgSrc from '../../images/clinical_trail_matching.svg';
import annotationStyles from '../column/annotation.module.scss';

export interface IClinicalTrialsCardProps {
    status: 'pending' | 'error' | 'complete';
    hugoGeneSymbol: string;
    hideClosedTrials?: boolean;
    indicator?: IndicatorQueryResp;
    trialsCache?: MobxCache;
}

@observer
export default class ClinicalTrialsCard extends React.Component<
    IClinicalTrialsCardProps,
    {}
> {
    private matchedTrials: { [key: string]: IMatchedTrials } = {};
    @observable selectedTreatment: string = '';

    public get trialsData(): ICache<any> {
        if (this.props.trialsCache && this.props.indicator) {
            this.props.trialsCache.get(this.props.indicator.query.tumorType);
        }

        return (this.props.trialsCache && this.props.trialsCache.cache) || {};
    }

    public render() {
        let cardContent: JSX.Element = (
            <span className={`${annotationStyles['annotation-item']}`} />
        );

        if (!this.props.indicator) {
            return cardContent;
        }

        if (this.props.status === 'error') {
            cardContent = errorIcon('Error fetching Trials data');
        } else if (this.props.status === 'pending') {
            cardContent = loaderIcon('pull-left');
        } else if (this.props.indicator.treatments.length > 0) {
            const treatments = this.props.indicator.treatments;
            const trialsCache: ICache<any> = this.trialsData;
            const trialsData =
                trialsCache[this.props.indicator.query.tumorType];
            if (treatments.length > 0 && trialsData && trialsData.data) {
                const treatmentButtonList: JSX.Element[] = [];

                treatments.forEach((treatment: IndicatorQueryTreatment) => {
                    const normalizedLevel =
                        normalizeLevel(treatment.level) || '';
                    const treatmentText = treatment.drugs
                        .map(drug => drug.drugName)
                        .join(' + ');
                    let trials = matchTrials(trialsData.data, treatmentText);
                    if (this.props.hideClosedTrials) {
                        trials = trials.filter((trial: ITrial) =>
                            isActiveTrial(trial.currentTrialStatus)
                        );
                    } else trials = classifiedByStatus(trials);
                    if (trials.length > 0) {
                        if (this.selectedTreatment === '') {
                            this.selectedTreatment = treatmentText; // the selected treatment is the 1st treatment by default
                        }
                        this.matchedTrials[treatmentText] = {
                            treatment: treatmentText,
                            trials: trials,
                        };
                        const treatmentTagContent: JSX.Element = (
                            <span style={{ display: 'inline-flex' }}>
                                <i
                                    className={`${levelIconClassNames(
                                        normalizedLevel
                                    )} ${styles['level-icon']}`}
                                />
                                <span>{`${treatmentText}: ${trials.length}`}</span>
                            </span>
                        );
                        treatmentButtonList.push(
                            <div
                                className={styles['treatment-pill-tag']}
                                onClick={() =>
                                    (this.selectedTreatment = treatmentText)
                                }
                            >
                                <TreatmentTag
                                    border="1px solid #1c75cd"
                                    defaultContentColor="#1c75cd"
                                    content={treatmentTagContent}
                                    backgroundColor={
                                        treatmentText === this.selectedTreatment
                                            ? '#1c75cd'
                                            : '#ffffff'
                                    }
                                />
                            </div>
                        );
                    }
                });

                if (Object.keys(this.matchedTrials).length > 0) {
                    const clinicalTrailImgWidth: number = 20;
                    const clinicalTrailImgHeight: number = 10;
                    cardContent = (
                        <span
                            className={`${annotationStyles['annotation-item']}`}
                        >
                            <img
                                width={clinicalTrailImgWidth}
                                height={clinicalTrailImgHeight}
                                src={clinicalTrailLogoImgSrc}
                                alt="Clinical Trail Entry"
                            />
                        </span>
                    );

                    cardContent = (
                        <DefaultTooltip
                            overlay={this.tooltipContent(
                                this.props.hugoGeneSymbol,
                                this.props.indicator.query,
                                treatmentButtonList
                            )}
                            align={{
                                points: ['tl', 'tr'],
                                offset: [0, -200],
                                targetOffset: [0, 0],
                                overflow: { adjustX: false, adjustY: false },
                            }}
                            placement="topRight"
                            trigger={['hover', 'focus']}
                            onPopupAlign={hideArrow}
                            destroyTooltipOnHide={true}
                        >
                            {cardContent}
                        </DefaultTooltip>
                    );
                }
            }
        }

        return cardContent;
    }

    @autobind
    private tooltipContent(
        hugoSymbol: string,
        evidenceQuery: Query,
        treatmentButtons: JSX.Element[]
    ): JSX.Element {
        let tooltipContent: JSX.Element = <span />;
        tooltipContent = (
            <div className={styles['card']}>
                <div className={styles['clinical-trial-card']}>
                    <div className={styles['title']}>
                        {`${hugoSymbol} ${evidenceQuery.alteration}`} in{' '}
                        <span className={styles['orange-icon']}>
                            {evidenceQuery.tumorType}
                        </span>
                    </div>
                    <div
                        style={{
                            margin: 10,
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        {treatmentButtons}
                    </div>
                    <div style={{ margin: 10 }}>
                        <span style={{ fontWeight: 'bold' }}>
                            Clinical Trials of{' '}
                            <span className={styles['orange-icon']}>
                                {this.selectedTreatment.toLowerCase()}
                            </span>
                            {'  in '}
                            <span className={styles['orange-icon']}>
                                {evidenceQuery.tumorType}
                            </span>
                            :{' '}
                            {
                                this.matchedTrials[this.selectedTreatment]
                                    .trials.length
                            }{' '}
                            trials <br />
                        </span>
                        <ClinicalTrialsTable
                            trials={
                                this.matchedTrials[this.selectedTreatment]
                                    .trials
                            }
                        />
                    </div>
                    <div style={{ marginTop: 10, marginBottom: 10 }}>
                        <a href={'https://oncokb.org'} target="_blank">
                            <img
                                src={oncoKbLogoImgSrc}
                                className={styles['oncokb-logo']}
                                alt="OncoKB"
                            />
                        </a>
                    </div>
                </div>
            </div>
        );

        return tooltipContent;
    }
}

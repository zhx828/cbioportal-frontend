import autobind from 'autobind-decorator';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { MobxCache } from 'cbioportal-utils';
import { IndicatorQueryResp } from 'oncokb-ts-api-client';
import * as React from 'react';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';

import {
    annotationIconClassNames,
    calcOncogenicScore,
    calcResistanceLevelScore,
    calcSensitivityLevelScore,
    levelIconClassNames,
    normalizeLevel,
} from '../../util/OncoKbUtils';
import { errorIcon, loaderIcon } from '../StatusHelpers';
import OncoKbTooltip from './OncoKbTooltip';
import OncoKbFeedback from './OncoKbFeedback';

import annotationStyles from '../column/annotation.module.scss';
import './oncokb.scss';
import 'oncokb-styles/dist/oncokb.css';
import { OncoKbCardDataType } from './OncoKbHelper';

export interface IOncoKbProps {
    status: 'pending' | 'error' | 'complete';
    indicator?: IndicatorQueryResp;
    availableDataTypes?: Set<OncoKbCardDataType>;
    pubMedCache?: MobxCache;
    usingPublicOncoKbInstance: boolean;
    isCancerGene: boolean;
    geneNotExist: boolean;
    hugoGeneSymbol: string;
    userEmailAddress?: string;
    disableFeedback?: boolean;
}

export function sortValue(
    indicator?: IndicatorQueryResp | undefined | null
): number[] {
    const values: number[] = [0, 0, 0];

    if (indicator) {
        values[0] = calcOncogenicScore(indicator.oncogenic);
        values[1] = calcSensitivityLevelScore(indicator.highestSensitiveLevel);
        values[2] = calcResistanceLevelScore(indicator.highestResistanceLevel);
    }

    return values;
}

export function download(
    indicator?: IndicatorQueryResp | undefined | null
): string {
    if (!indicator) {
        return 'NA';
    }

    const oncogenic = indicator.oncogenic ? indicator.oncogenic : 'Unknown';
    const level = indicator.highestSensitiveLevel
        ? indicator.highestSensitiveLevel.toLowerCase()
        : 'level NA';

    return `${oncogenic}, ${level}`;
}

export function hideArrow(tooltipEl: any) {
    const arrowEl = tooltipEl.querySelector('.rc-tooltip-arrow');
    arrowEl.style.display = 'none';
}

@observer
export default class OncoKB extends React.Component<IOncoKbProps, {}> {
    constructor(props: any) {
        super(props);
        makeObservable(this);
    }
    @observable showFeedback: boolean = false;
    @observable tooltipDataLoadComplete: boolean = false;

    public render() {
        let oncoKbContent: JSX.Element = (
            <span className={`${annotationStyles['annotation-item']}`} />
        );

        if (this.props.status === 'error') {
            oncoKbContent = errorIcon('Error fetching OncoKB data');
        } else if (this.props.status === 'pending') {
            oncoKbContent = loaderIcon('pull-left');
        } else {
            oncoKbContent = (
                <>
                    {!this.props.usingPublicOncoKbInstance &&
                        this.props.indicator && (
                            <>
                                {this.getAnnotationIcon(
                                    OncoKbCardDataType.BIOLOGICAL
                                )}
                                {this.getAnnotationIcon(OncoKbCardDataType.TXS)}
                                {this.getAnnotationIcon(OncoKbCardDataType.TXR)}
                                {this.getAnnotationIcon(OncoKbCardDataType.DX)}
                                {this.getAnnotationIcon(OncoKbCardDataType.PX)}
                            </>
                        )}
                </>
            );
            if (!this.props.disableFeedback && this.showFeedback) {
                oncoKbContent = (
                    <span>
                        {oncoKbContent}
                        <OncoKbFeedback
                            userEmailAddress={this.props.userEmailAddress}
                            hugoSymbol={this.props.hugoGeneSymbol}
                            alteration={
                                this.props.indicator
                                    ? this.props.indicator.query.alteration
                                    : undefined
                            }
                            showFeedback={this.showFeedback}
                            handleFeedbackClose={this.handleFeedbackClose}
                        />
                    </span>
                );
            }
        }

        return oncoKbContent;
    }

    private getAnnotationIcon(type: OncoKbCardDataType) {
        if (
            type !== OncoKbCardDataType.BIOLOGICAL &&
            !this.props.availableDataTypes?.has(type)
        ) {
            return null;
        }
        let highestLevel = '';
        if (this.props.indicator) {
            switch (type) {
                case OncoKbCardDataType.TXS:
                    highestLevel = this.props.indicator.highestSensitiveLevel;
                    break;
                case OncoKbCardDataType.TXR:
                    highestLevel = this.props.indicator.highestResistanceLevel;
                    break;
                case OncoKbCardDataType.DX:
                    highestLevel = this.props.indicator
                        .highestDiagnosticImplicationLevel;
                    break;
                case OncoKbCardDataType.PX:
                    highestLevel = this.props.indicator
                        .highestPrognosticImplicationLevel;
                    break;
            }
        }
        const shouldHaveTooltip =
            type === OncoKbCardDataType.BIOLOGICAL || highestLevel;
        return (
            <span className={`${annotationStyles['annotation-item']}`}>
                <DefaultTooltip
                    overlayClassName="oncokb-tooltip"
                    overlay={() =>
                        shouldHaveTooltip ? this.tooltipContent(type) : null
                    }
                    placement="right"
                    // visible
                    trigger={['hover', 'focus']}
                    onPopupAlign={hideArrow}
                    destroyTooltipOnHide={true}
                >
                    <i
                        className={
                            type === OncoKbCardDataType.BIOLOGICAL
                                ? annotationIconClassNames(
                                      true,
                                      this.props.indicator
                                  )
                                : levelIconClassNames(
                                      normalizeLevel(highestLevel) || ''
                                  )
                        }
                        data-test="oncogenic-icon-image"
                        data-test2={this.props.hugoGeneSymbol}
                    />
                </DefaultTooltip>
            </span>
        );
    }

    @autobind
    private tooltipContent(type: OncoKbCardDataType): JSX.Element {
        return (
            <OncoKbTooltip
                type={type}
                usingPublicOncoKbInstance={this.props.usingPublicOncoKbInstance}
                hugoSymbol={this.props.hugoGeneSymbol}
                geneNotExist={this.props.geneNotExist}
                isCancerGene={this.props.isCancerGene}
                indicator={this.props.indicator || undefined}
                pubMedCache={this.props.pubMedCache}
                handleFeedbackOpen={
                    this.props.disableFeedback
                        ? undefined
                        : this.handleFeedbackOpen
                }
            />
        );
    }

    @autobind
    private handleFeedbackOpen(): void {
        this.showFeedback = true;
    }

    @autobind
    private handleFeedbackClose(): void {
        this.showFeedback = false;
    }
}

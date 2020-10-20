import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { computed, observable } from 'mobx';
import classnames from 'classnames';

import tabsStyles from './tabs.module.scss';
import OncoKbCardLevelsOfEvidenceDropdown from './OncoKbCardLevelsOfEvidenceDropdown';
import mainStyles from './main.module.scss';
import OncoKBSuggestAnnotationLinkout from './OncoKBSuggestAnnotationLinkout';
import { IndicatorQueryResp } from 'oncokb-ts-api-client';
import OncoKbHelper, { OncoKbCardDataType } from './OncoKbHelper';
import { ICache } from '../../model/SimpleCache';
import { Tab, Tabs } from 'react-bootstrap';
import { BiologicalContent } from './oncokbCard/BiologicalContent';
import { ImplicationContent } from './oncokbCard/ImplicationContent';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import OncoKbTreatmentTable from './OncoKbTreatmentTable';

const OncoKbMedicalDisclaimer = (
    <p className={mainStyles.disclaimer}>
        The information above is intended for research purposes only and should
        not be used as a substitute for professional diagnosis and treatment.
    </p>
);

const ONCOKB_DATA_ACCESS_PAGE_LINK =
    'https://docs.cbioportal.org/2.4-integration-with-other-webservices/oncokb-data-access';

const publicInstanceDisclaimerOverLay = (
    <div>
        <p>
            This instance of cBioPortal does not currently have a license for
            full OncoKB content and is therefore missing therapeutic
            implications. To obtain a license, please follow{' '}
            <a href={ONCOKB_DATA_ACCESS_PAGE_LINK} target={'_blank'}>
                these instructions
            </a>
            .
        </p>
        {OncoKbMedicalDisclaimer}
    </div>
);

export type OncoKbCardBodyProps = {
    type: OncoKbCardDataType;
    geneNotExist: boolean;
    isCancerGene: boolean;
    hugoSymbol: string;
    pmidData: ICache;
    indicator?: IndicatorQueryResp;
    usingPublicOncoKbInstance: boolean;
};

export const OncoKbCardBody: React.FunctionComponent<OncoKbCardBodyProps> = props => {
    let defaultEventKey = props.type;
    if (
        [OncoKbCardDataType.TXS, OncoKbCardDataType.TXR].includes(
            defaultEventKey
        )
    ) {
        defaultEventKey = OncoKbCardDataType.TXS;
    }
    const [activateTabKey, setActivateTabKey] = useState(defaultEventKey);
    const [levelsOfEvidence, setLevelsOfEvidence] = useState(
        getLevelsOfEvidence(activateTabKey)
    );

    function updateActivateTabKey(newKey: any) {
        setActivateTabKey(newKey);
        setLevelsOfEvidence(getLevelsOfEvidence(newKey));
    }

    function getBody(type: OncoKbCardDataType, indicator: IndicatorQueryResp) {
        const tabs = [];
        if (
            indicator.mutationEffect &&
            (indicator.mutationEffect.description ||
                indicator.mutationEffect.citations.abstracts.length > 0 ||
                indicator.mutationEffect.citations.pmids.length > 0)
        ) {
            tabs.push(
                <Tab
                    eventKey={OncoKbCardDataType.BIOLOGICAL}
                    title="Biological Effect"
                >
                    <BiologicalContent
                        mutationEffectCitations={
                            indicator.mutationEffect.citations
                        }
                        biologicalSummary={indicator.mutationEffect.description}
                        pmidData={props.pmidData}
                    />
                </Tab>
            );
        }
        if (
            indicator.highestSensitiveLevel ||
            indicator.highestResistanceLevel
        ) {
            tabs.push(
                <Tab
                    eventKey={OncoKbCardDataType.TXS}
                    title="Therapeutic Implications"
                >
                    <p>{indicator.tumorTypeSummary}</p>

                    {indicator.treatments!.length > 0 && (
                        <div
                            style={{
                                marginTop: 10,
                            }}
                        >
                            <OncoKbTreatmentTable
                                variant={indicator.query.alteration || ''}
                                pmidData={props.pmidData!}
                                treatments={indicator.treatments!}
                            />
                        </div>
                    )}
                </Tab>
            );
        }
        if (indicator.highestDiagnosticImplicationLevel) {
            tabs.push(
                <Tab
                    eventKey={OncoKbCardDataType.DX}
                    title="Diagnostic Implications"
                >
                    <ImplicationContent
                        variant={indicator.query.alteration}
                        summary={indicator.diagnosticSummary}
                        implications={indicator.diagnosticImplications}
                        pmidData={props.pmidData}
                    />
                </Tab>
            );
        }
        if (indicator.highestPrognosticImplicationLevel) {
            tabs.push(
                <Tab
                    eventKey={OncoKbCardDataType.PX}
                    title="Prognostic Implications"
                >
                    <ImplicationContent
                        variant={indicator.query.alteration}
                        summary={indicator.prognosticSummary}
                        implications={indicator.prognosticImplications}
                        pmidData={props.pmidData}
                    />
                </Tab>
            );
        }
        return (
            <div style={{ padding: '10px' }}>
                <p>{indicator.geneSummary}</p>
                <p>{indicator.variantSummary}</p>
                {props.usingPublicOncoKbInstance ? (
                    <p className={mainStyles.disclaimer}>
                        Therapeutic levels are not available in this instance of
                        cBioPortal.{' '}
                        <DefaultTooltip
                            overlayStyle={{
                                maxWidth: 400,
                            }}
                            overlay={publicInstanceDisclaimerOverLay}
                        >
                            <i className={'fa fa-info-circle'}></i>
                        </DefaultTooltip>
                    </p>
                ) : null}
                {tabs.length > 0 && (
                    <Tabs
                        defaultActiveKey={defaultEventKey}
                        className={classnames('oncokb-card-tabs')}
                        onSelect={updateActivateTabKey}
                    >
                        {tabs}
                    </Tabs>
                )}
            </div>
        );
    }

    function getLevelsOfEvidence(activateTabKey: OncoKbCardDataType) {
        switch (activateTabKey) {
            case OncoKbCardDataType.TXS:
            case OncoKbCardDataType.TXR:
                return {
                    levels: OncoKbHelper.TX_LEVELS,
                    levelDes: OncoKbHelper.getLevelsDesc(activateTabKey),
                };
            case OncoKbCardDataType.DX:
                return {
                    levels: OncoKbHelper.DX_LEVELS,
                    levelDes: OncoKbHelper.getLevelsDesc(OncoKbCardDataType.DX),
                };
            case OncoKbCardDataType.PX:
                return {
                    levels: OncoKbHelper.PX_LEVELS,
                    levelDes: OncoKbHelper.getLevelsDesc(OncoKbCardDataType.PX),
                };
            default:
                return {
                    levels: [],
                    levelDes: {},
                };
        }
    }

    return (
        <>
            {!props.geneNotExist && (
                <div>
                    {props.indicator && (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    backgroundColor: '#064785',
                                    color: '#ffa500',
                                    padding: '10px 0',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ flexGrow: 1 }}>
                                    {props.indicator.oncogenic || 'Unknown'}
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    {props.indicator.mutationEffect
                                        .knownEffect || 'Unknown'}
                                </div>
                            </div>
                            <div
                                className={mainStyles['oncokb-card']}
                                data-test="oncokb-card"
                            >
                                {getBody(props.type, props.indicator)}
                            </div>
                        </>
                    )}
                    {!props.usingPublicOncoKbInstance && (
                        <>
                            {/*Use tab pane style for the disclaimer to keep the consistency since the info is attached right under the tab pane*/}
                            <div className={tabsStyles['tab-pane']}>
                                {OncoKbMedicalDisclaimer}
                            </div>
                            {levelsOfEvidence &&
                                levelsOfEvidence.levels.length > 0 && (
                                    <OncoKbCardLevelsOfEvidenceDropdown
                                        levels={levelsOfEvidence.levels}
                                        levelDes={levelsOfEvidence.levelDes}
                                    />
                                )}
                        </>
                    )}
                </div>
            )}
            {!props.isCancerGene && (
                <div
                    className={mainStyles['additional-info']}
                    data-test={'oncokb-card-additional-info'}
                >
                    There is currently no information about this gene in OncoKB.
                </div>
            )}
            {props.geneNotExist && props.isCancerGene && (
                <div className={mainStyles['additional-info']}>
                    <OncoKBSuggestAnnotationLinkout gene={props.hugoSymbol!} />
                </div>
            )}
        </>
    );
};

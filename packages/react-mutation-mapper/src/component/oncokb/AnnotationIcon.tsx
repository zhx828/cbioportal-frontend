import React from 'react';
import { OncoKbCardDataType } from 'cbioportal-utils';
import { IndicatorQueryResp, LevelOfEvidence } from 'oncokb-ts-api-client';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

import {
    DIAGNOSTIC_LEVEL,
    levelIconClassNames,
    normalizeLevel,
    ONCOGENICITY,
    oncogenicityIconClassNames,
    PROGNOSTIC_LEVEL,
} from '../../util/OncoKbUtils';

import annotationStyles from '../column/annotation.module.scss';
import OncoKbCompactIcon from './OncoKbCompactIcon';

export function hideArrow(tooltipEl: any) {
    const arrowEl = tooltipEl.querySelector('.rc-tooltip-arrow');
    arrowEl.style.display = 'none';
}

export const AnnotationIcon: React.FunctionComponent<{
    type: OncoKbCardDataType;
    tooltipOverlay?: JSX.Element;
    indicator?: IndicatorQueryResp;
    availableDataTypes?: OncoKbCardDataType[];
}> = props => {
    if (
        props.availableDataTypes !== undefined &&
        !props.availableDataTypes.includes(props.type)
    ) {
        return null;
    }
    let highestLevel = '';
    if (props.indicator) {
        switch (props.type) {
            case OncoKbCardDataType.TXS:
                highestLevel = props.indicator.highestSensitiveLevel;
                break;
            case OncoKbCardDataType.TXR:
                highestLevel = props.indicator.highestResistanceLevel;
                break;
            case OncoKbCardDataType.DX:
                highestLevel =
                    props.indicator.highestDiagnosticImplicationLevel;
                break;
            case OncoKbCardDataType.PX:
                highestLevel =
                    props.indicator.highestPrognosticImplicationLevel;
                break;
        }
    }
    return (
        <span className={`${annotationStyles['annotation-item']}`}>
            <DefaultTooltip
                overlayClassName="oncokb-tooltip"
                overlay={() =>
                    props.tooltipOverlay ? props.tooltipOverlay : null
                }
                placement="right"
                trigger={['hover', 'focus']}
                onPopupAlign={hideArrow}
                destroyTooltipOnHide={true}
            >
                <OncoKbCompactIcon
                    oncogenicity={props.indicator?.oncogenic as ONCOGENICITY}
                    txSLevel={
                        props.indicator
                            ?.highestSensitiveLevel as LevelOfEvidence
                    }
                    txRLevel={
                        props.indicator
                            ?.highestResistanceLevel as LevelOfEvidence
                    }
                    dxLevel={
                        props.indicator
                            ?.highestDiagnosticImplicationLevel as DIAGNOSTIC_LEVEL
                    }
                    pxLevel={
                        props.indicator
                            ?.highestPrognosticImplicationLevel as PROGNOSTIC_LEVEL
                    }
                />
            </DefaultTooltip>
        </span>
    );
};

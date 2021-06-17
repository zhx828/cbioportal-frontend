import * as React from 'react';

import { LevelOfEvidence } from 'oncokb-ts-api-client';
import {
    DIAGNOSTIC_LEVEL,
    ONCOGENICITY,
    PROGNOSTIC_LEVEL,
} from '../../util/OncoKbUtils';

function getOncogneicityHex(oncogenicity: ONCOGENICITY) {
    switch (oncogenicity) {
        case ONCOGENICITY.ONCOGENIC:
        case ONCOGENICITY.LIKELY_ONCOGENIC:
        case ONCOGENICITY.PREDICTED_ONCOGENIC:
        case ONCOGENICITY.RESISTANCE:
            return '#007FFF';
        case ONCOGENICITY.LIKELY_NEUTRAL:
            return '#696969';
        case ONCOGENICITY.INCONCLUSIVE:
            return '#AAAAAA';
        case ONCOGENICITY.UNKNOWN:
        case ONCOGENICITY.EMPTY:
            return '#CCCCCC';
        default:
            return '';
    }
}

function getTierHex(tier: 1 | 2 | 3 | 4) {
    switch (tier) {
        case 1:
            return '#33A02C';
        case 2:
            return '#1F78B4';
        case 3:
            return '#984EA3';
        case 4:
            return '#424242';
    }
}

function getTxStyle(level: LevelOfEvidence) {
    switch (level) {
        case LevelOfEvidence.LEVEL_1:
            return getTierHex(1);
        case LevelOfEvidence.LEVEL_2:
            return getTierHex(2);
        case LevelOfEvidence.LEVEL_3A:
            return getTierHex(3);
        case LevelOfEvidence.LEVEL_3B:
            return '#BE98CE';
        case LevelOfEvidence.LEVEL_4:
            return getTierHex(4);
        case LevelOfEvidence.LEVEL_R1:
            return '#EE3424';
        case LevelOfEvidence.LEVEL_R2:
            return '#F79A92';
        case LevelOfEvidence.LEVEL_R3:
            return '#FCD6D3';
        default:
            return '';
    }
}

function getDxStyle(level: DIAGNOSTIC_LEVEL) {
    switch (level) {
        case DIAGNOSTIC_LEVEL.Dx1:
            return getTierHex(1);
        case DIAGNOSTIC_LEVEL.Dx2:
            return getTierHex(2);
        case DIAGNOSTIC_LEVEL.Dx3:
            return getTierHex(3);
    }
}

function getPxStyle(level: PROGNOSTIC_LEVEL) {
    switch (level) {
        case PROGNOSTIC_LEVEL.Px1:
            return getTierHex(1);
        case PROGNOSTIC_LEVEL.Px2:
            return getTierHex(2);
        case PROGNOSTIC_LEVEL.Px3:
            return getTierHex(3);
    }
}

const OncoKbCompactIcon: React.FunctionComponent<{
    oncogenicity: ONCOGENICITY;
    txSLevel: LevelOfEvidence;
    txRLevel: LevelOfEvidence;
    dxLevel: DIAGNOSTIC_LEVEL;
    pxLevel: PROGNOSTIC_LEVEL;
}> = props => {
    return (
        <svg width={18} height={18}>
            <g transform="translate(9, 9)">
                <circle
                    r="6"
                    fill="none"
                    stroke-width="2"
                    stroke={getOncogneicityHex(props.oncogenicity)}
                ></circle>
                <circle
                    r="3"
                    fill="none"
                    stroke-width="2"
                    stroke={getOncogneicityHex(props.oncogenicity)}
                ></circle>
                <circle
                    r="1.5"
                    fill={getOncogneicityHex(props.oncogenicity)}
                    stroke="none"
                ></circle>
            </g>
            {props.txSLevel && (
                <g transform="translate(14.5, 3.5)">
                    <circle
                        r="4"
                        fill={getTxStyle(props.txSLevel)}
                        stroke="#ffffff"
                        stroke-width="1"
                    ></circle>
                </g>
            )}
            {props.txRLevel && (
                <g transform="translate(14.5, 14.5)">
                    <circle
                        r="4"
                        fill={getTxStyle(props.txRLevel)}
                        stroke="#ffffff"
                        stroke-width="1"
                    ></circle>
                </g>
            )}
            {props.dxLevel && (
                <g transform="translate(-0.5, -0.5)">
                    <rect
                        width="7"
                        height="7"
                        fill={getDxStyle(props.dxLevel)}
                        stroke="#ffffff"
                        stroke-width="1"
                    ></rect>
                </g>
            )}
            {props.pxLevel && (
                <g transform="translate(0, 10.5)">
                    <polygon
                        points="3.5 0, 8 8, -1 8"
                        fill={getPxStyle(props.pxLevel)}
                        stroke="#ffffff"
                        stroke-width="1"
                    />
                </g>
            )}
        </svg>
    );
};

export default OncoKbCompactIcon;

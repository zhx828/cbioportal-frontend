import _ from 'lodash';
import { DefaultTooltip, ICache, LEVELS } from 'cbioportal-frontend-commons';
import { ArticleAbstract, IndicatorQueryTreatment } from 'oncokb-ts-api-client';
import { observer } from 'mobx-react';
import * as React from 'react';
import ReactTable from 'react-table';

import {
    getPositionalVariant,
    getTumorTypeName,
    levelIconClassNames,
    mergeAlterations,
    normalizeLevel,
} from '../../util/OncoKbUtils';
import {
    defaultArraySortMethod,
    defaultSortMethod,
} from '../../util/ReactTableUtils';
import OncoKbHelper from './OncoKbHelper';
import ReferenceList from './ReferenceList';
import SummaryWithRefs from './SummaryWithRefs';

import mainStyles from './main.module.scss';
import './oncoKbTreatmentTable.scss';

type OncoKbTreatmentTableProps = {
    variant: string;
    treatments: IndicatorQueryTreatment[];
    pmidData: ICache<any>;
};

@observer
export default class OncoKbTreatmentTable extends React.Component<
    OncoKbTreatmentTableProps
> {
    levelTooltipContent = (level: string) => {
        return (
            <div style={{ maxWidth: '200px' }}>
                {OncoKbHelper.LEVEL_DESC[level]}
            </div>
        );
    };

    treatmentTooltipContent = (
        abstracts: ArticleAbstract[],
        pmids: number[],
        pmidData: ICache<any>,
        description?: string
    ) => {
        return abstracts.length > 0 || pmids.length > 0 ? (
            () => (
                <div className={mainStyles['tooltip-refs']}>
                    {description !== undefined && description.length > 0 ? (
                        <SummaryWithRefs
                            content={description}
                            type={'tooltip'}
                            pmidData={this.props.pmidData}
                        />
                    ) : (
                        <ReferenceList
                            pmids={pmids}
                            pmidData={pmidData}
                            abstracts={abstracts}
                        />
                    )}
                </div>
            )
        ) : (
            <span />
        );
    };

    readonly columns = [
        OncoKbHelper.getDefaultColumnDefinition('level'),
        {
            ...OncoKbHelper.getDefaultColumnDefinition('alterations'),
            Cell: (props: { value: string[] }) => {
                return OncoKbHelper.getAlterationsColumnCell(
                    props.value,
                    this.props.variant
                );
            },
        },
        {
            id: 'treatment',
            Header: <span>Drug(s)</span>,
            accessor: 'drugs',
            Cell: (props: { original: IndicatorQueryTreatment }) => (
                <div style={{ whiteSpace: 'normal', lineHeight: '1rem' }}>
                    {props.original.drugs
                        .map(drug => drug.drugName)
                        .join(' + ')}
                </div>
            ),
        },
        {
            id: 'cancerType',
            Header: (
                <span>
                    Level-associated
                    <br />
                    cancer type(s)
                </span>
            ),
            accessor: 'levelAssociatedCancerType',
            minWidth: 120,
            Cell: (props: { original: IndicatorQueryTreatment }) => (
                <div style={{ whiteSpace: 'normal', lineHeight: '1rem' }}>
                    {getTumorTypeName(props.original.levelAssociatedCancerType)}
                </div>
            ),
        },
        {
            id: 'referenceList',
            Header: <span />,
            sortable: false,
            maxWidth: 25,
            Cell: (props: { original: IndicatorQueryTreatment }) =>
                (props.original.abstracts.length > 0 ||
                    props.original.pmids.length > 0) && (
                    <DefaultTooltip
                        overlay={this.treatmentTooltipContent(
                            props.original.abstracts,
                            props.original.pmids.map(pmid => Number(pmid)),
                            this.props.pmidData,
                            props.original.description
                        )}
                        placement="right"
                        trigger={['hover', 'focus']}
                        destroyTooltipOnHide={true}
                    >
                        <i className="fa fa-book" />
                    </DefaultTooltip>
                ),
        },
    ];

    public render() {
        return (
            <div className="oncokb-treatment-table">
                <ReactTable
                    data={this.props.treatments}
                    columns={this.columns}
                    showPagination={false}
                    pageSize={this.props.treatments.length}
                    className="-striped -highlight"
                />
            </div>
        );
    }
}

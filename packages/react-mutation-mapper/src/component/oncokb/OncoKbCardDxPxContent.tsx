import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { Implication } from 'oncokb-ts-api-client';
import * as React from 'react';

import { ICache } from '../../model/SimpleCache';
import SummaryWithRefs from './SummaryWithRefs';
import OncoKbHelper from './OncoKbHelper';
import ReactTable from 'react-table';

type OncoKbCardImplicationTableProps = {
    variant: string;
    geneSummary: string;
    variantSummary: string;
    dxpxSummary: string;
    implications: Implication[];
    pmidData: ICache;
};

export const OncoKbCardDxPxContent: React.FunctionComponent<
    OncoKbCardImplicationTableProps
> = (tableProps: OncoKbCardImplicationTableProps) => {
    const columns = [
        {
            ...OncoKbHelper.getDefaultColumnDefinition('level'),
            accessor: 'levelOfEvidence',
            maxWidth: 100,
        },
        {
            ...OncoKbHelper.getDefaultColumnDefinition('alterations'),
            Cell: (props: { value: string[] }) => {
                return OncoKbHelper.getAlterationsColumnCell(
                    props.value,
                    tableProps.variant
                );
            },
        },
        {
            id: 'referenceList',
            Header: <span />,
            sortable: false,
            maxWidth: 50,
            Cell: (props: { original: Implication }) =>
                props.original.description && (
                    <DefaultTooltip
                        overlay={() => (
                            <SummaryWithRefs
                                content={props.original.description}
                                type={'tooltip'}
                                pmidData={tableProps.pmidData}
                            />
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

    return (
        <div style={{ padding: 10 }}>
            <p>{tableProps.geneSummary}</p>
            <p>{tableProps.variantSummary}</p>
            <p>{tableProps.dxpxSummary}</p>
            <div>
                <ReactTable
                    data={tableProps.implications}
                    columns={columns}
                    showPagination={false}
                    pageSize={tableProps.implications.length}
                    className="-striped -highlight"
                />
            </div>
        </div>
    );
};

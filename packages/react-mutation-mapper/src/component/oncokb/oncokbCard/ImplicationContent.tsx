import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { Implication } from 'oncokb-ts-api-client';
import * as React from 'react';

import { ICache } from '../../../model/SimpleCache';
import SummaryWithRefs from '../SummaryWithRefs';
import OncoKbHelper from '../OncoKbHelper';
import ReactTable from 'react-table';

type ImplicationContentProps = {
    variant: string;
    summary: string;
    implications: Implication[];
    pmidData: ICache;
};

export const ImplicationContent: React.FunctionComponent<ImplicationContentProps> = (
    props: ImplicationContentProps
) => {
    const columns = [
        {
            ...OncoKbHelper.getDefaultColumnDefinition('level'),
            accessor: 'levelOfEvidence',
            maxWidth: 100,
        },
        {
            ...OncoKbHelper.getDefaultColumnDefinition('alterations'),
            Cell: (cellProps: { value: string[] }) => {
                return OncoKbHelper.getAlterationsColumnCell(
                    cellProps.value,
                    props.variant
                );
            },
        },
        {
            id: 'referenceList',
            Header: <span />,
            sortable: false,
            maxWidth: 50,
            Cell: (cellProps: { original: Implication }) =>
                cellProps.original.description && (
                    <DefaultTooltip
                        overlay={() => (
                            <SummaryWithRefs
                                content={cellProps.original.description}
                                type={'tooltip'}
                                pmidData={props.pmidData}
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
        <div>
            <p>{props.summary}</p>
            <div>
                <ReactTable
                    data={props.implications}
                    columns={columns}
                    showPagination={false}
                    pageSize={props.implications.length}
                    className="-striped -highlight"
                />
            </div>
        </div>
    );
};

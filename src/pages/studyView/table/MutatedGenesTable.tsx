import * as React from "react";
import {GeneIdentifier, MutationCountByGeneWithCancerGene} from "pages/studyView/StudyViewPageStore";
import {observer} from "mobx-react";
import styles from "./tables.module.scss";
import LabeledCheckbox from "../../../shared/components/labeledCheckbox/LabeledCheckbox";
import MobxPromise from "mobxpromise";
import {If} from 'react-if';
import * as _ from 'lodash';
import classnames from 'classnames';
import DefaultTooltip from "shared/components/defaultTooltip/DefaultTooltip";
import FixedHeaderTable from "./FixedHeaderTable";
import {action, computed, IReactionDisposer, observable, reaction} from "mobx";
import autobind from 'autobind-decorator';
import {
    correctMargin,
    correctColumnWidth,
    getFixedHeaderNumberCellMargin,
    getFixedHeaderTableMaxLengthStringPixel,
    getFrequencyStr,
    getQValue
} from "../StudyViewUtils";
import {Column, SortDirection} from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import {
    getCancerGeneFilterToggleIcon,
    getCancerGeneToggledOverlay,
} from "../TableUtils";
import {GeneCell} from "./GeneCell";

export interface IMutatedGenesTablePros {
    promise: MobxPromise<MutationCountByGeneWithCancerGene[]>;
    width: number;
    height: number;
    filters: number[];
    onUserSelection: (value: GeneIdentifier[]) => void;
    numOfSelectedSamples: number;
    onGeneSelect: (hugoGeneSymbol: string) => void;
    selectedGenes: string[];
}

type MutatedGenesTableUserSelectionWithIndex = {
    entrezGeneId: number;
    hugoGeneSymbol: string;
    rowIndex: number;
}

enum ColumnKey {
    GENE = 'Gene',
    NUMBER_MUTATIONS = '# Mut',
    NUMBER = '#',
    FREQ = 'Freq'
}
class MutatedGenesTableComponent extends FixedHeaderTable<MutationCountByGeneWithCancerGene> {
}

@observer
export class MutatedGenesTable extends React.Component<IMutatedGenesTablePros, {}> {
    @observable private preSelectedRows: MutatedGenesTableUserSelectionWithIndex[] = [];
    @observable private sortBy: string = ColumnKey.FREQ;
    @observable private sortDirection: SortDirection;
    @observable private cancerGeneFilterIsOn = true;

    private reactions:IReactionDisposer[] = [];

    constructor(props: IMutatedGenesTablePros) {
        super(props);
    }

    componentWillUnmount() {
        for (const disposer of this.reactions) {
            disposer();
        }
    }

    @computed
    get columnsWidth() {
        return {
            [ColumnKey.GENE]: correctColumnWidth(this.props.width * 0.35),
            [ColumnKey.NUMBER_MUTATIONS]: correctColumnWidth(this.props.width * 0.25),
            [ColumnKey.NUMBER]: correctColumnWidth(this.props.width * 0.25),
            [ColumnKey.FREQ]: correctColumnWidth(this.props.width * 0.15)
        };
    }

    @computed
    get cellMargin() {
        return {
            [ColumnKey.GENE]: 0,
            [ColumnKey.NUMBER_MUTATIONS]: correctMargin(
                getFixedHeaderNumberCellMargin(
                    this.columnsWidth[ColumnKey.NUMBER_MUTATIONS],
                    _.max(this.tableData.map(item => item.totalCount))!.toLocaleString()
                )
            ),
            [ColumnKey.NUMBER]: correctMargin(
                (this.columnsWidth[ColumnKey.NUMBER] - 10 - (
                        getFixedHeaderTableMaxLengthStringPixel(
                            _.max(this.tableData.map(item => item.countByEntity))!.toLocaleString()
                        ) + 20)
                ) / 2),
            [ColumnKey.FREQ]: correctMargin(
                getFixedHeaderNumberCellMargin(
                    this.columnsWidth[ColumnKey.FREQ],
                    getFrequencyStr(_.max(this.tableData.map(item => item.frequency))!)
                )
            )
        }
    }

    @autobind
    toggelCancerGeneFilter(event:any) {
        event.stopPropagation();
        this.cancerGeneFilterIsOn=!this.cancerGeneFilterIsOn;
    }

    @computed get tableData() {
        return this.cancerGeneFilterIsOn ? _.filter(this.props.promise.result, data => data.isCancerGene) : (this.props.promise.result || []);
    }


    @computed
    get tableColumns():Column<MutationCountByGeneWithCancerGene>[] {
        return [{
            name: ColumnKey.GENE,
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[ColumnKey.GENE], display: 'flex'}}>
                    <DefaultTooltip
                        mouseEnterDelay={0}
                        placement="top"
                        overlay={getCancerGeneToggledOverlay(this.cancerGeneFilterIsOn)}
                    >
                        <div onClick={this.toggelCancerGeneFilter}>
                            {getCancerGeneFilterToggleIcon(this.cancerGeneFilterIsOn)}
                        </div>
                    </DefaultTooltip>
                    {ColumnKey.GENE}
                </div>
            },
            render: (data: MutationCountByGeneWithCancerGene) => {
                return <GeneCell
                    tableType={'mutation'}
                    selectedGenes={this.props.selectedGenes}
                    hugoGeneSymbol={data.hugoGeneSymbol}
                    qValue={data.qValue}
                    isCancerGene={data.isCancerGene}
                    oncokbAnnotated={data.oncokbAnnotated}
                    isOncogene={data.oncokbOcg}
                    isTSG={data.oncokbTsg}
                    onGeneSelect={this.props.onGeneSelect}
                />
            },
            sortBy: (data: MutationCountByGeneWithCancerGene) => data.hugoGeneSymbol,
            defaultSortDirection: 'asc' as 'asc',
            filter: (data: MutationCountByGeneWithCancerGene, filterString: string, filterStringUpper: string) => {
                return data.hugoGeneSymbol.toUpperCase().includes(filterStringUpper);
            },
            width: this.columnsWidth[ColumnKey.GENE]
        }, {
            name: ColumnKey.NUMBER_MUTATIONS,
            tooltip: (<span>Total number of mutations</span>),
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[ColumnKey.NUMBER_MUTATIONS]}}># Mut</div>
            },
            render: (data: MutationCountByGeneWithCancerGene) => <span
                style={{
                    flexDirection: 'row-reverse',
                    display: 'flex',
                    marginRight: this.cellMargin[ColumnKey.NUMBER_MUTATIONS]
                }}>{data.totalCount.toLocaleString()}</span>,
            sortBy: (data: MutationCountByGeneWithCancerGene) => data.totalCount,
            defaultSortDirection: 'desc' as 'desc',
            filter: (data: MutationCountByGeneWithCancerGene, filterString: string) => {
                return _.toString(data.totalCount).includes(filterString);
            },
            width: this.columnsWidth[ColumnKey.NUMBER_MUTATIONS]
        }, {
            name: ColumnKey.NUMBER,
            tooltip: (<span>Number of samples with one or more mutations</span>),
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[ColumnKey.NUMBER]}}>#</div>
            },
            render: (data: MutationCountByGeneWithCancerGene) =>
                <LabeledCheckbox
                    checked={this.isChecked(data.entrezGeneId)}
                    disabled={this.isDisabled(data.entrezGeneId)}
                    onChange={event => this.togglePreSelectRow(data.entrezGeneId)}
                    labelProps={{
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginLeft: this.cellMargin[ColumnKey.NUMBER],
                            marginRight: this.cellMargin[ColumnKey.NUMBER]
                        }
                    }}
                    inputProps={{
                        className: styles.autoMarginCheckbox
                    }}
                >
                    <span>{data.countByEntity.toLocaleString()}</span>
                </LabeledCheckbox>,
            sortBy: (data: MutationCountByGeneWithCancerGene) => data.countByEntity,
            defaultSortDirection: 'desc' as 'desc',
            filter: (data: MutationCountByGeneWithCancerGene, filterString: string) => {
                return _.toString(data.countByEntity).includes(filterString);
            },
            width: this.columnsWidth[ColumnKey.NUMBER]
        }, {
            name: ColumnKey.FREQ,
            tooltip: (<span>Percentage of samples with one or more mutations</span>),
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[ColumnKey.FREQ]}}>Freq</div>
            },
            render: (data: MutationCountByGeneWithCancerGene) => <span
                style={{
                    flexDirection: 'row-reverse',
                    display: 'flex',
                    marginRight: this.cellMargin[ColumnKey.FREQ]
                }}>{getFrequencyStr(data.frequency)}</span>,
            sortBy: (data: MutationCountByGeneWithCancerGene) => data.frequency,
            defaultSortDirection: 'desc' as 'desc',
            filter: (data: MutationCountByGeneWithCancerGene, filterString: string) => {
                return _.toString(getFrequencyStr(data.frequency)).includes(filterString);
            },
            width: this.columnsWidth[ColumnKey.FREQ]
        }];
    }

    @autobind
    isChecked(entrezGeneId: number) {
        let record = _.find(this.preSelectedRows, (row: MutatedGenesTableUserSelectionWithIndex) => row.entrezGeneId === entrezGeneId);
        if (_.isUndefined(record)) {
            return this.selectedRows.length > 0 && !_.isUndefined(_.find(this.selectedRows, (row: MutatedGenesTableUserSelectionWithIndex) => row.entrezGeneId === entrezGeneId));
        } else {
            return true;
        }
    }

    @autobind
    isDisabled(entrezGeneId: number) {
        return !_.isUndefined(_.find(this.selectedRows, (row: MutatedGenesTableUserSelectionWithIndex) => row.entrezGeneId === entrezGeneId));
    }

    @autobind
    togglePreSelectRow(entrezGeneId: number) {
        let record: MutatedGenesTableUserSelectionWithIndex | undefined = _.find(this.preSelectedRows, (row: MutatedGenesTableUserSelectionWithIndex) => row.entrezGeneId === entrezGeneId);
        if (_.isUndefined(record)) {
            let dataIndex = -1;
            // definitely there is a match
            let datum: MutationCountByGeneWithCancerGene | undefined = _.find(this.tableData, (row: MutationCountByGeneWithCancerGene, index: number) => {
                let exist = row.entrezGeneId === entrezGeneId;
                if (exist) {
                    dataIndex = index;
                }
                return exist;
            });

            if (!_.isUndefined(datum)) {
                this.preSelectedRows.push({
                    rowIndex: dataIndex,
                    entrezGeneId: datum.entrezGeneId,
                    hugoGeneSymbol: datum.hugoGeneSymbol
                })
            }
        } else {
            this.preSelectedRows = _.xorBy(this.preSelectedRows, [record], 'rowIndex');
        }
    }


    @autobind
    @action
    afterSelectingRows() {
        this.props.onUserSelection(this.preSelectedRows.map(row => {
            return {
                entrezGeneId: row.entrezGeneId,
                hugoGeneSymbol: row.hugoGeneSymbol
            };
        }));
        this.preSelectedRows = [];
    }

    @computed
    get selectedRows() {
        if (this.props.filters.length === 0) {
            return [];
        } else {
            return _.reduce(this.tableData, (acc: MutatedGenesTableUserSelectionWithIndex[], row: MutationCountByGeneWithCancerGene, index: number) => {
                if (_.includes(this.props.filters, row.entrezGeneId)) {
                    acc.push({
                        rowIndex: index,
                        entrezGeneId: row.entrezGeneId,
                        hugoGeneSymbol: row.hugoGeneSymbol
                    });
                }
                return acc;
            }, []);
        }
    }

    @autobind
    isSelectedRow(data: MutationCountByGeneWithCancerGene) {
        return !_.isUndefined(_.find(_.union(this.selectedRows, this.preSelectedRows), function (row) {
            return row.entrezGeneId === data.entrezGeneId;
        }));
    }

    @autobind
    @action
    afterSorting(sortBy: string, sortDirection: SortDirection) {
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
    }

    public render() {
        return (
            <MutatedGenesTableComponent
                width={this.props.width}
                height={this.props.height}
                data={this.tableData}
                columns={this.tableColumns}
                showSelectSamples={true && this.preSelectedRows.length > 0}
                isSelectedRow={this.isSelectedRow}
                afterSelectingRows={this.afterSelectingRows}
                sortBy={this.sortBy}
                sortDirection={this.sortDirection}
                afterSorting={this.afterSorting}
            />
        );
    }
}


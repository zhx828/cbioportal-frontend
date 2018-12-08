import * as React from "react";
import {GeneIdentifier, MutatedGenesData} from "pages/studyView/StudyViewPageStore";
import {observer} from "mobx-react";
import styles from "./tables.module.scss";
import {MutationCountByGene} from "shared/api/generated/CBioPortalAPIInternal";
import LabeledCheckbox from "../../../shared/components/labeledCheckbox/LabeledCheckbox";
import MobxPromise from "mobxpromise";
import {If} from 'react-if';
import * as _ from 'lodash';
import classnames from 'classnames';
import DefaultTooltip from "shared/components/defaultTooltip/DefaultTooltip";
import FixedHeaderTable from "./FixedHeaderTable";
import {action, computed, observable, reaction} from "mobx";
import autobind from 'autobind-decorator';
import {getFixedHeaderNumberCellMargin, getFrequencyStr, getMaxLengthStringPixel, getQValue} from "../StudyViewUtils";
import {SortDirection} from "../../../shared/components/lazyMobXTable/LazyMobXTable";

export interface IMutatedGenesTablePros {
    promise: MobxPromise<MutatedGenesData>;
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

class MutatedGenesTableComponent extends FixedHeaderTable<MutationCountByGene> {
}

@observer
export class MutatedGenesTable extends React.Component<IMutatedGenesTablePros, {}> {
    @observable private preSelectedRows: MutatedGenesTableUserSelectionWithIndex[] = [];
    @observable private sortBy: string = '#';
    @observable private sortDirection: SortDirection;
    @observable private cellMargin: number[] = [0, 0, 0, 0];

    constructor(props: IMutatedGenesTablePros) {
        super(props);
        reaction(() => this.columnsWidth, () => {
            this.updateCellMargin();
        }, {fireImmediately: true});
        reaction(() => this.props.promise.result, () => {
            this.updateCellMargin();
        }, {fireImmediately: true});
    }

    @computed
    get columnsWidth() {
        return [
            this.props.width * 0.35,
            this.props.width * 0.25,
            this.props.width * 0.25,
            this.props.width * 0.15,
        ];
    }

    @autobind
    @action
    updateCellMargin() {
        this.cellMargin = [
            0,
            getFixedHeaderNumberCellMargin(this.columnsWidth[1], this.props.promise.result!.map(item => item.totalCount.toLocaleString())),
            (this.columnsWidth[2] - 10 - (getMaxLengthStringPixel(this.props.promise.result!.map(item => item.countByEntity.toLocaleString())) + 20)) / 2,
            getFixedHeaderNumberCellMargin(this.columnsWidth[3], this.props.promise.result!.map(item => getFrequencyStr(item.frequency))),
        ].map(margin => margin > 0 ? margin : 0);
    }

    @computed
    get tableColumns() {
        return [{
            name: 'Gene',
            tooltip: (<span>Gene</span>),
            render: (data: MutationCountByGene) => {
                const addGeneOverlay = () =>
                    <span>{`Click ${data.hugoGeneSymbol} to ${_.includes(this.props.selectedGenes, data.hugoGeneSymbol) ? 'remove from' : 'add to'} your query`}</span>;
                const qvalOverlay = () =>
                    <div><b>MutSig</b><br/><i>Q-value: </i><span>{getQValue(data.qValue)}</span></div>;
                return (
                    <div className={styles.displayFlex}>
                        <DefaultTooltip
                            placement="left"
                            overlay={addGeneOverlay}
                            destroyTooltipOnHide={true}
                        >
                            <span
                                className={classnames(styles.geneSymbol, styles.ellipsisText, _.includes(this.props.selectedGenes, data.hugoGeneSymbol) ? styles.selected : undefined, _.isUndefined(data.qValue) ? undefined : styles.shortenText)}
                                onClick={() => this.props.onGeneSelect(data.hugoGeneSymbol)}>
                                {data.hugoGeneSymbol}
                            </span>
                        </DefaultTooltip>
                        <If condition={!_.isUndefined(data.qValue)}>
                            <DefaultTooltip
                                placement="right"
                                overlay={qvalOverlay}
                                destroyTooltipOnHide={true}
                            >
                                    <span><img src={require("./images/mutsig.png")}
                                               className={styles.mutSig}></img></span>
                            </DefaultTooltip>
                        </If>
                    </div>
                )
            },
            sortBy: (data: MutationCountByGene) => data.hugoGeneSymbol,
            defaultSortDirection: 'asc' as 'asc',
            filter: (data: MutationCountByGene, filterString: string, filterStringUpper: string) => {
                return data.hugoGeneSymbol.toUpperCase().includes(filterStringUpper);
            },
            width: this.columnsWidth[0]
        }, {
            name: '# Mut',
            tooltip: (<span>Total number of mutations</span>),
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[1]}}># Mut</div>
            },
            render: (data: MutationCountByGene) => <span
                style={{
                    flexDirection: 'row-reverse',
                    display: 'flex',
                    marginRight: this.cellMargin[1]
                }}>{data.totalCount.toLocaleString()}</span>,
            sortBy: (data: MutationCountByGene) => data.totalCount,
            defaultSortDirection: 'desc' as 'desc',
            filter: (data: MutationCountByGene, filterString: string) => {
                return _.toString(data.totalCount).includes(filterString);
            },
            width: this.columnsWidth[1]
        }, {
            name: '#',
            tooltip: (<span>Number of samples with one or more mutations</span>),
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[2]}}>#</div>
            },
            render: (data: MutationCountByGene) =>
                <LabeledCheckbox
                    checked={this.isChecked(data.entrezGeneId)}
                    disabled={this.isDisabled(data.entrezGeneId)}
                    onChange={event => this.togglePreSelectRow(data.entrezGeneId)}
                    labelProps={{
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginLeft: this.cellMargin[2],
                            marginRight: this.cellMargin[2]
                        }
                    }}
                >
                    <span>{data.countByEntity.toLocaleString()}</span>
                </LabeledCheckbox>,
            sortBy: (data: MutationCountByGene) => data.countByEntity,
            defaultSortDirection: 'desc' as 'desc',
            filter: (data: MutationCountByGene, filterString: string) => {
                return _.toString(data.countByEntity).includes(filterString);
            },
            width: this.columnsWidth[2]
        }, {
            name: 'Freq',
            tooltip: (<span>Percentage of samples with one or more mutations</span>),
            headerRender: () => {
                return <div style={{marginLeft: this.cellMargin[3]}}>Freq</div>
            },
            render: (data: MutationCountByGene) => <span
                style={{
                    flexDirection: 'row-reverse',
                    display: 'flex',
                    marginRight: this.cellMargin[3]
                }}>{getFrequencyStr(data.frequency)}</span>,
            sortBy: (data: MutationCountByGene) => data.frequency,
            defaultSortDirection: 'desc' as 'desc',
            filter: (data: MutationCountByGene, filterString: string) => {
                return _.toString(getFrequencyStr(data.frequency)).includes(filterString);
            },
            width: this.columnsWidth[3]
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
            let datum: MutationCountByGene | undefined = _.find(this.props.promise.result, (row: MutationCountByGene, index: number) => {
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
            return _.reduce(this.props.promise.result, (acc: MutatedGenesTableUserSelectionWithIndex[], row: MutationCountByGene, index: number) => {
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
    isSelectedRow(data: MutationCountByGene) {
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
                data={this.props.promise.result || []}
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


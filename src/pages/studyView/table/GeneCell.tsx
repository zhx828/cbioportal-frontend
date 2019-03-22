import * as React from 'react';
import * as _ from 'lodash';
import styles from "./tables.module.scss";
import classnames from 'classnames';
import DefaultTooltip from "../../../shared/components/defaultTooltip/DefaultTooltip";
import {getGeneColumnCellOverlay, getGeneColumnCellOverlaySimple} from "../TableUtils";
import {getQValue} from "../StudyViewUtils";
import {action, observable} from 'mobx';
import {observer} from 'mobx-react';
import autobind from 'autobind-decorator';
import {If, Then, Else} from 'react-if';

export type IGeneCellProps = {
    tableType: 'mutation' | 'cna',
    selectedGenes: string[],
    hugoGeneSymbol: string,
    qValue: number,
    isCancerGene: boolean,
    oncokbAnnotated: boolean,
    isOncogene: boolean,
    isTSG: boolean,
    onGeneSelect: (hugoGeneSymbol: string) => void
}

@observer
export class GeneCell extends React.Component<IGeneCellProps, {}> {
    @observable isVisible: boolean = false;

    @autobind
    @action
    onVisibleChange(isVisible: boolean) {
        this.isVisible = isVisible;
    }

    render() {
        const geneIsSelected = _.includes(this.props.selectedGenes, this.props.hugoGeneSymbol);
        const qvalTypeName = this.props.tableType === 'mutation' ? 'MutSig' : 'Gistic';
        const qvalType = qvalTypeName.toLowerCase();
        const qvalOverlay = () =>
            <div><b>{qvalTypeName}</b><br/><i>Q-value: </i><span>{getQValue(this.props.qValue)}</span></div>;

        return (
            <DefaultTooltip
                mouseEnterDelay={0}
                placement="left"
                // onVisibleChange={this.onVisibleChange}
                disabled={!this.props.isCancerGene}
                overlay={getGeneColumnCellOverlaySimple(this.props.hugoGeneSymbol, geneIsSelected, this.props.isCancerGene, this.props.oncokbAnnotated, this.props.isOncogene, this.props.isTSG)}
                destroyTooltipOnHide={true}
            >
                <div className={classnames(styles.geneSymbol, styles.displayFlex)}
                     onMouseEnter={()=>this.onVisibleChange(true)}
                     onMouseLeave={()=>this.onVisibleChange(false)}
                     onClick={() => this.props.onGeneSelect(this.props.hugoGeneSymbol)}>
                <span
                    className={classnames(styles.ellipsisText, this.props.isCancerGene ? styles.cancerGene : undefined, _.isUndefined(this.props.qValue) ? undefined : styles.shortenText)}>
                    {this.props.hugoGeneSymbol}
                </span>
                    <span style={{marginLeft: 5}}>
                        <If condition={geneIsSelected}>
                            <Then>
                                <span className="fa-stack" style={{fontSize: 9}}>
                                    <i className="fa fa-square fa-stack-2x"></i>
                                    <i className="fa fa-thumb-tack fa-stack-1x fa-inverse"></i>
                                </span>
                            </Then>
                            <Else>
                                <If condition={this.isVisible}>
                                    <span className="fa-stack" style={{fontSize: 9}}>
                                        <i className="fa fa-square-o fa-stack-2x"></i>
                                        <i className="fa fa-thumb-tack fa-stack-1x"></i>
                                    </span>
                                </If>
                            </Else>
                        </If>
                    </span>
                    <If condition={!_.isUndefined(this.props.qValue)}>
                        <DefaultTooltip
                            placement="right"
                            overlay={qvalOverlay}
                            destroyTooltipOnHide={true}
                        >
                    <span>
                        <img src={require(`./images/${qvalType}.png`)} className={styles[qvalType]}></img>
                    </span>
                        </DefaultTooltip>
                    </If>
                </div>
            </DefaultTooltip>
        )
    }
}
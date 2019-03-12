import * as React from "react";
import {If} from 'react-if';
import {computed} from "mobx";
import {observer} from "mobx-react";
import {saveSvgAsPng} from "save-svg-as-png";
import {getOncoKbImage} from "../../../shared/components/tracks/OncoKbTrack";
import styles from '../table/tables.module.scss'
import {STUDY_VIEW_CONFIG} from "../StudyViewConfig";


type OncokbIconLinkImgProps = {
    oncokbAnnotated: boolean,
    isCancerGene: boolean,
    hugoSymbol: string,
    oncokbOcg: boolean,
    oncobkbTsg: boolean
}

@observer
export class OncokbIconLinkImg extends React.Component<OncokbIconLinkImgProps, {}> {
    constructor(props: OncokbIconLinkImgProps) {
        super(props);
    }

    @computed
    get geneLinkout() {
        return this.props.oncokbAnnotated ? `https://oncokb.org/gene/${this.props.hugoSymbol}` : 'https://oncokb.org/cancerGenes';
    }

    getOncokbIcon() {
        return this.props.isCancerGene ? <a className={styles.cancerGenesRow} href={this.geneLinkout}
                                            target="_blank">{getOncoKbImage()}</a> : <span></span>;
    }

    getGeneTypeText() {
        let content = [];
        if (this.props.oncokbOcg) {
            content.push(<span style={{color: STUDY_VIEW_CONFIG.colors.deletion, marginLeft:2, fontWeight: 'bold'}}>O</span>);
        }
        if (this.props.oncobkbTsg) {
            content.push(<span style={{color: STUDY_VIEW_CONFIG.colors.amplification, marginLeft:2, fontWeight: 'bold'}}>T</span>);
        }
        if (content.length === 2) {
            content.splice(1, 0, <span>/</span>);
        }
        return content;
    }

    render() {
        return <span>{!this.props.oncobkbTsg && !this.props.oncokbOcg ? this.getOncokbIcon() : this.getGeneTypeText()}</span>;
    }
}
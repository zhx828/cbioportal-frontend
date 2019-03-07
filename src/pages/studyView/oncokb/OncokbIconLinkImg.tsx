import * as React from "react";
import {If} from 'react-if';
import {computed} from "mobx";
import {observer} from "mobx-react";
import {saveSvgAsPng} from "save-svg-as-png";
import {getOncoKbImage} from "../../../shared/components/tracks/OncoKbTrack";
import styles from '../table/tables.module.scss'


type OncokbIconLinkImgProps = {
    oncokbAnnotated: boolean,
    isCancerGene: boolean,
    hugoSymbol: string,
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

    render() {
        return this.props.isCancerGene ? <a className={styles.cancerGenesRow} href={this.geneLinkout}
                                            target="_blank">{getOncoKbImage()}</a> : <span></span>;
    }
}
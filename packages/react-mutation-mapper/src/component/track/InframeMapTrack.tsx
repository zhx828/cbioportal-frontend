import { IHotspotIndex, Mutation } from 'cbioportal-utils';
import * as React from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { computed, makeObservable } from 'mobx';

import { DataFilterType } from '../../model/DataFilter';
import MutationMapperStore from '../../model/MutationMapperStore';
import Track, { TrackProps } from './Track';
import { TrackItemSpec, TrackItemType } from './TrackItem';

import hotspotImg from '../../images/cancer-hotspots.svg';

type HotspotTrackProps = TrackProps & {
    store: MutationMapperStore<Mutation>;
    hotspotIndex: IHotspotIndex;
};

export function getHotspotImage() {
    return <img src={hotspotImg} alt="Recurrent Hotspot Symbol" />;
}

@observer
export default class InframeMapTrack extends React.Component<
    HotspotTrackProps,
    {}
> {
    constructor(props: any) {
        super(props);
        makeObservable(this);
    }
    @computed get hotspotSpecs(): TrackItemSpec[] {
        let allHotspot = this.props.store.localHotspotData.result || [];
        if (allHotspot) {
            allHotspot = allHotspot.filter(
                hotspot =>
                    hotspot.type === 'in-frame indel' &&
                    hotspot.hugoSymbol === 'EGFR'
            );
        }
        if (!_.isEmpty(allHotspot)) {
            return allHotspot.map(hotspot => ({
                startCodon: hotspot.start,
                endCodon: hotspot.end,
                itemType: TrackItemType.RECTANGLE,
                color: '#FF9900',
                tooltip: (
                    <div>
                        <div>{`${hotspot.start}-${hotspot.end}`}</div>
                    </div>
                ),
            }));
        } else {
            return [];
        }
    }

    @computed get allOncokbAlterations() {
        let allOncokbAlterations =
            this.props.store.oncokbAnnotatedAlterations.result || [];
        if (allOncokbAlterations) {
            allOncokbAlterations = allOncokbAlterations.filter(
                variant =>
                    variant.gene.hugoSymbol === 'EGFR' &&
                    ['inframe_deletion', 'inframe_insertion'].includes(
                        variant.consequence.term
                    )
            );
        }
        return allOncokbAlterations.sort(
            (a, b) =>
                a.proteinStart - b.proteinStart || a.proteinEnd - b.proteinEnd
        );
    }

    @computed get oncokbCuratedSpecs(): TrackItemSpec[] {
        if (!_.isEmpty(this.allOncokbAlterations)) {
            return this.allOncokbAlterations.map(alteration => ({
                startCodon: alteration.proteinStart,
                endCodon: alteration.proteinEnd,
                itemType: TrackItemType.RECTANGLE,
                color: '#007FFF',
                tooltip: (
                    <div>
                        <div>{`${alteration.name} (${alteration.alteration})`}</div>
                        <div>{`${alteration.proteinStart}-${alteration.proteinEnd}`}</div>
                    </div>
                ),
            }));
        } else {
            return [];
        }
    }

    @computed get trackTitle() {
        return (
            <span>
                <span style={{ marginRight: 2 }}>{getHotspotImage()}</span>
                In-frame Indel
            </span>
        );
    }

    public render() {
        return (
            <>
                <Track
                    dataStore={this.props.dataStore}
                    defaultFilters={[
                        {
                            type: DataFilterType.INFRAME_MAP,
                            values: [],
                        },
                    ]}
                    width={this.props.width}
                    xOffset={this.props.xOffset}
                    proteinLength={this.props.proteinLength}
                    trackTitle={this.trackTitle}
                    trackItems={this.hotspotSpecs}
                    idClassPrefix={'cancer-hotspot-inframe-'}
                />
                <Track
                    dataStore={this.props.dataStore}
                    defaultFilters={[
                        {
                            type: DataFilterType.INFRAME_MAP,
                            values: [],
                        },
                    ]}
                    width={this.props.width}
                    xOffset={this.props.xOffset}
                    proteinLength={this.props.proteinLength}
                    trackTitle={<span>OncoKB: all in-frame</span>}
                    trackItems={this.oncokbCuratedSpecs}
                    idClassPrefix={'cancer-hotspot-oncokb-inframe-'}
                />
                {this.allOncokbAlterations.map(alteration => (
                    <Track
                        dataStore={this.props.dataStore}
                        defaultFilters={[
                            {
                                type: DataFilterType.INFRAME_MAP,
                                values: [],
                            },
                        ]}
                        width={this.props.width}
                        xOffset={this.props.xOffset}
                        proteinLength={this.props.proteinLength}
                        trackTitle={<span>OncoKB:{alteration.name}</span>}
                        trackItems={[
                            {
                                startCodon: alteration.proteinStart,
                                endCodon:
                                    alteration.proteinStart ===
                                    alteration.proteinEnd
                                        ? undefined
                                        : alteration.proteinEnd,
                                itemType:
                                    alteration.proteinStart ===
                                    alteration.proteinEnd
                                        ? TrackItemType.CIRCLE
                                        : TrackItemType.RECTANGLE,
                                color: '#007FFF',
                                tooltip: (
                                    <div>
                                        <div>{`${alteration.name} (${alteration.alteration})`}</div>
                                        <div>{`${alteration.proteinStart}-${alteration.proteinEnd}`}</div>
                                    </div>
                                ),
                            },
                        ]}
                        idClassPrefix={'cancer-hotspot-oncokb-inframe-'}
                    />
                ))}
            </>
        );
    }
}

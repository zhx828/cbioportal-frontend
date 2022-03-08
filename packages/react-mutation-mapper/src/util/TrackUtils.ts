import { TrackName, TrackVisibility } from '../component/track/TrackSelector';

export function initDefaultTrackVisibility(): TrackVisibility {
    return {
        [TrackName.OncoKB]: 'visible',
        [TrackName.CancerHotspots]: 'visible',
        [TrackName.dbPTM]: 'hidden',
        [TrackName.UniprotPTM]: 'hidden',
        [TrackName.PDB]: 'hidden',
        [TrackName.Exon]: 'visible',
        [TrackName.UniprotTopology]: 'hidden',
        [TrackName.INFRAME_MAP]: 'visible',
    };
}

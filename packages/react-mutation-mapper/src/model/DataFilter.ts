export enum DataFilterType {
    ONCOKB = 'oncokb',
    INFRAME_MAP = 'inframeMap',
    HOTSPOT = 'hotspot',
    POSITION = 'position',
    MUTATION = 'mutation',
    CANCER_TYPE = 'cancerType',
    PROTEIN_IMPACT_TYPE = 'proteinImpactType',
    MUTATION_STATUS = 'mutationStatus',
}

export type DataFilter<T = any> = {
    id?: string;
    type: string;
    values: T[];
};

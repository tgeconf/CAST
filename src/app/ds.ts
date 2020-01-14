export type TSortDataAttr = {
    attr: string
    sort: string
}

export type TDataItem = {
    [propName: string]: string | number
}

export type TKeyframe = {
    continued: boolean
    timePoint: number
    highlightingMarks?: string[]//marks that should be highlighted
}

export type TDataDatumType = {
    [key: string]: string | number
}
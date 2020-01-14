export interface ISortDataAttr {
    attr: string
    sort: string
}

export interface IDataItem {
    [propName: string]: string | number
}

export interface IKeyframe {
    continued: boolean
    highlightingMarks?: string[]//marks that should be highlighted
}
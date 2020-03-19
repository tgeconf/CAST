export interface ISortDataAttr {
    attr: string
    sort: string
}

export interface IDataItem {
    [propName: string]: string | number
}

export interface IKfGroupSize {
    width?: number
    height?: number
}

export interface IKeyframe {
    id: string
    parentId: string //keyframe group id
    durationIcon: boolean
    duration: number
    delayIcon: boolean
    delay: number
    allCurrentMarks: string[] // marks until this kf
    marksThisKf: string[] //markid array
}

export interface IKeyframeGroup {
    groupRef: string
    id: string
    aniId: string
    parentId: string //keyframe group id
    children?: IKeyframeGroup[]
    keyframes?: IKeyframe[]
    // numKf: number
    // numGroup: number
    marks: string[]
    timingRef: string
    delayIcon: boolean
    delay: number
    offsetIcon?: boolean
    offset?: number // for aniunit only
    alignType?: string
    alignTarget?: string //target at an animation id
    newTrack: boolean;
}

export interface IDataDatumType {
    [key: string]: string | number
}
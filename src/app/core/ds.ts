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
    id: number
    timingRef: string;
    // parentObj: IKeyframeGroup //keyframe group id
    durationIcon: boolean
    duration: number
    delayIcon: boolean
    delay: number
    allCurrentMarks: string[] // marks until this kf
    allGroupMarks: string[]
    marksThisKf: string[] //markid array
    alignWith?: string[] //array of aniIds which are aligned to this kf
    alignWithKfs?: number[] // array of keyframeIds which are aligned to this kf
    alignTo?: number //align to keyframeid
}

export interface IKeyframeGroup {
    groupRef: string
    refValue?: string
    id: number
    aniId: string
    // parentObj: IKeyframeGroup | {} //keyframe group id
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
    alignId?: string
    alignType?: string
    alignTarget?: string //target at an animation id
    merge?: boolean
    newTrack: boolean;
}

export interface IDataDatumType {
    [key: string]: string | number
}

export interface IPath {
    attrComb: string[]
    sortedAttrValueComb: string[]
    kfMarks: string[][]
    firstKfMarks: string[]
    lastKfMarks: string[]
}
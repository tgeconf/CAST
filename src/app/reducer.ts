import { state } from './state'
import { IDataItem, ISortDataAttr, IKeyframeGroup, IKfGroupSize, IPath, IKeyframe } from './core/ds'
import * as action from './action'
import Util from './core/util'
import { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie'
import KfTimingIllus from '../components/widgets/kfTimingIllus'
import KfItem from '../components/widgets/kfItem'
import Canis, { Animation, TimingSpec } from 'canis_toolkit'
import KfGroup from '../components/widgets/kfGroup'
import CanisGenerator, { IChartSpec, ICanisSpec, IAnimationSpec, canis, IGrouping } from './core/canisGenerator'
import PlusBtn from '../components/widgets/plusBtn'
import Suggest from './core/suggest'
import Tool from '../util/tool'
import KfOmit from '../components/widgets/kfOmit'
import Renderer from './renderer'
import { kfContainer, KfContainer } from '../components/kfContainer'
import { suggestBox } from '../components/widgets/suggestBox'

export default class Reducer {
    static list: any = {};

    public static listen(key: string, fn: any): void {
        if (!this.list[key]) {
            this.list[key] = [];
        }
        this.list[key].push(fn);
    }

    public static triger(key: string, prop: any): void {
        let fns = this.list[key];
        if (!fns || fns.length == 0) {
            return;
        }
        for (var i = 0, fn; fn = fns[i++];) {
            fn.apply(this, [prop]);
        }
    }

    public static updateAniAlign(actionType: string, actionInfo: { targetAni: string, currentAni: string }) {
        const animations: IAnimationSpec[] = state.spec.animations;
        let currentAni: IAnimationSpec;
        let currentAniIdx: number;
        let targetAni: IAnimationSpec;
        let targetAniIdx: number;
        for (let i = 0, len = animations.length; i < len; i++) {
            let a: IAnimationSpec = animations[i];
            if (`${a.chartIdx}_${a.selector}` === actionInfo.currentAni) {
                currentAni = a;
                currentAniIdx = i;
            } else if (`${a.chartIdx}_${a.selector}` === actionInfo.targetAni) {
                targetAni = a;
                targetAniIdx = i;
            }
        }
        let targetAniId: string;
        switch (actionType) {
            case action.UPDATE_ANI_ALIGN_AFTER_ANI:
                currentAni.reference = TimingSpec.timingRef.previousEnd;
                break;
            case action.UPDATE_ANI_ALIGN_WITH_ANI:
                currentAni.reference = TimingSpec.timingRef.previousStart;
                break;
            case action.UPDATE_ANI_ALIGN_AFTER_KF:
                if (typeof targetAni.id === 'undefined') {
                    targetAni.id = actionInfo.targetAni
                }
                animations[targetAniIdx] = targetAni;
                targetAniId = targetAni.id;
                currentAni.align = { type: 'element', target: targetAniId, merge: false };
                currentAni.reference = TimingSpec.timingRef.previousEnd;
                break;
            case action.UPDATE_ANI_ALIGN_WITH_KF:
                if (typeof targetAni.id === 'undefined') {
                    targetAni.id = actionInfo.targetAni
                }
                animations[targetAniIdx] = targetAni;
                targetAniId = targetAni.id;
                currentAni.align = { type: 'element', target: targetAniId, merge: false };
                currentAni.reference = TimingSpec.timingRef.previousStart;
                break;
        }
        animations.splice(currentAniIdx, 1);
        for (let i = 0, len = animations.length; i < len; i++) {
            let a: IAnimationSpec = animations[i];
            if (`${a.chartIdx}_${a.selector}` === actionInfo.targetAni) {
                animations.splice(i + 1, 0, currentAni);
                break;
            }
        }
        state.spec = { ...state.spec, animations: animations };
    }
}

Reducer.listen(action.RESET_STATE, () => {
    Reducer.triger(action.UPDATE_SELECTION, []);
    state.spec = { charts: state.spec.charts, animations: [] };
    suggestBox.removeSuggestBox();
})

Reducer.listen(action.UPDATE_DATA_SORT, (sdaArr: ISortDataAttr[]) => {
    state.sortDataAttrs = Util.filterDataSort(sdaArr);
})
Reducer.listen(action.UPDATE_DATA_ORDER, (dord: string[]) => {
    state.dataOrder = dord;
})
Reducer.listen(action.UPDATE_DATA_TABLE, (dt: Map<string, IDataItem>) => {
    state.dataTable = dt;
})
Reducer.listen(action.LOAD_CHARTS, (chartContent: string[]) => {
    document.getElementById('chartContainer').innerHTML = '';
    state.charts = chartContent;
})
Reducer.listen(action.TOGGLE_SUGGESTION, (suggestion: boolean) => {
    state.suggestion = suggestion;
})
Reducer.listen(action.UPDATE_SELECTION, (selection: string[]) => {
    if (state.suggestion && selection.length > 0) {
        selection = Util.suggestSelection(selection);
    }
    state.selection = selection;
})
Reducer.listen(action.UPDATE_LOTTIE, (lai: AnimationItem) => {
    state.lottieAni = lai;
})
Reducer.listen(action.UPDATE_STATIC_KEYFRAME, (staticMarks: string[]) => {
    state.staticMarks = staticMarks;
})
Reducer.listen(action.UPDATE_KEYFRAME_TRACKS, (animations: Map<string, any>) => {
    //reset the min and max duraiton of KfItem
    PlusBtn.allPlusBtn = [];
    KfItem.allKfItems.clear();
    KfItem.allKfInfo.clear();
    KfGroup.allActions.clear();
    KfGroup.allAniGroups.clear();
    const rootGroup: IKeyframeGroup[] = [];
    [...animations].forEach((a: any) => {
        rootGroup.push(Util.aniRootToKFGroup(a[1].root, a[0], {}, -1));
        KfGroup.allActions.set(a[0], a[1].actions[0]);
    });
    if (rootGroup.length > 0) {
        rootGroup[0].newTrack = false;
    }
    state.keyframeGroups = rootGroup;
})
Reducer.listen(action.UPDATE_KEYFRAME_CONTAINER_SLIDER, (kfGroupSize: IKfGroupSize) => {
    state.kfGroupSize = kfGroupSize;
})

Reducer.listen(action.LOAD_ANIMATION_SPEC, (animationSpec: any) => {
    state.spec = { ...state.spec, animations: animationSpec };
})

Reducer.listen(action.UPDATE_SPEC_CHARTS, (charts: string[]) => {
    document.getElementById(KfContainer.KF_POPUP).innerHTML = '';
    const chartSpecs: IChartSpec[] = CanisGenerator.generateChartSpec(charts);
    let tmpSpec: ICanisSpec = { charts: chartSpecs, animations: [] };
    state.spec = tmpSpec;
})

Reducer.listen(action.UPDATE_MOUSE_MOVING, (mm: boolean) => {
    state.mousemoving = mm;
})




Reducer.listen(action.UPDATE_DELAY_BETWEEN_KF, (actionInfo: { aniId: string, delay: number }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            if (typeof a.grouping === 'undefined') {
                a.grouping = {
                    groupBy: 'id',
                    delay: actionInfo.delay
                }
            } else {
                CanisGenerator.updateKfDelay(a.grouping, actionInfo.delay);
            }
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.REMOVE_DELAY_BETWEEN_KF, (actionInfo: { aniId: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.removeKfDelay(a.grouping);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_KF_TIMING_REF, (actionInfo: { aniId: string, ref: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateKfRef(a.grouping, actionInfo.ref);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_TIMING_REF_DELAY_KF, (actionInfo: { aniId: string, ref: string, delay: number }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateKfRefAndDelay(a.grouping, actionInfo.ref, actionInfo.delay);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.REMOVE_LOWESTGROUP, (actionInfo: { aniId: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            //if there is only one level grouping, change timing to start with previous
            let oneLevelGrouping: boolean = false;
            if (typeof a.grouping === 'undefined') {
                oneLevelGrouping = true;
            } else {
                if (typeof a.grouping.grouping === 'undefined') {
                    oneLevelGrouping = true;
                }
            }
            if (oneLevelGrouping) {
                // Reducer.triger(action.UPDATE_KF_TIMING_REF, { aniId: actionInfo.aniId, ref: TimingSpec.timingRef.previousStart })
                delete a.grouping;
            } else {
                CanisGenerator.removeLowestGrouping(a.grouping);
            }
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_TIMEING_REF_BETWEEN_GROUP, (actionInfo: { aniId: string, groupRef: string, ref: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateGroupTiming(a.grouping, actionInfo.groupRef, actionInfo.ref);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_DELAY_BETWEEN_GROUP, (actionInfo: { aniId: string, groupRef: string, delay: number }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateGroupDelay(a.grouping, actionInfo.groupRef, actionInfo.delay);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_DELAY_TIMING_REF_BETWEEN_GROUP, (actionInfo: { aniId: string, groupRef: string, delay: number, ref: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateGroupDelayTiming(a.grouping, actionInfo.groupRef, actionInfo.delay, actionInfo.ref);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.REMOVE_DELAY_BETWEEN_GROUP, (actionInfo: { aniId: string, groupRef: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.removeGroupDelay(a.grouping, actionInfo.groupRef);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.REMOVE_DELAY_UPDATE_TIMING_REF_GROUP, (actionInfo: { aniId: string, groupRef: string, ref: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.removeGroupDelayUpdateTiming(a.grouping, actionInfo.groupRef, actionInfo.ref);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.MERGE_GROUP, (actionInfo: { aniId: string, groupRef: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            a.grouping = CanisGenerator.mergeGroup(a.grouping, actionInfo.groupRef);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_DURATION, (actionInfo: { aniId: string, duration: number }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateDuration(a.effects[0], actionInfo.duration);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_ANI_OFFSET, (actionInfo: { aniId: string, offset: number }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateAniOffset(a, actionInfo.offset);
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_STATIC_SELECTOR, (addStaticMarks: string[]) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    let emptyAniRecorder: number[] = [];
    animations.forEach((a: IAnimationSpec, idx: number) => {
        CanisGenerator.updateStaticSelector(a, addStaticMarks);
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_SUGGESTION_PATH, (actionInfo: { ap: IPath[], kfIdxInPath: number, startKf: KfItem, suggestOnFirstKf: boolean, selectedMarks: string[] }) => {
    state.allPaths = actionInfo.ap;
    Renderer.renderSuggestKfs(actionInfo.kfIdxInPath, actionInfo.startKf, actionInfo.suggestOnFirstKf, actionInfo.selectedMarks);
})

Reducer.listen(action.UPDATE_SPEC_SELECTOR, (actionInfo: { aniId: string, selector: string }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    animations.forEach((a: IAnimationSpec) => {
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            a.selector = actionInfo.selector;
        }
    })
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_SPEC_GROUPING, (actionInfo: { aniId: string, attrComb: string[], attrValueSort: string[][] }) => {
    if (actionInfo.attrComb.length > 0) {
        const animations: IAnimationSpec[] = state.spec.animations;
        animations.forEach((a: IAnimationSpec) => {
            if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
                CanisGenerator.updateGrouping(a, actionInfo.attrComb, actionInfo.attrValueSort);
            }
        })
        state.spec = { ...state.spec, animations: animations };
    }
})

Reducer.listen(action.SPLIT_CREATE_MULTI_ANI, (actionInfo: { aniId: string, path: IPath, attrValueSort: string[][] }) => {
    //extract marks with same shape
    const shapeAttrIdx: number = actionInfo.path.attrComb.indexOf('mShape');
    actionInfo.path.attrComb.splice(shapeAttrIdx, 1);
    actionInfo.attrValueSort.splice(shapeAttrIdx, 1);
    console.log('shape attr idx: ', shapeAttrIdx, actionInfo.path.attrComb);
    const shapeMarkMap: Map<string, string[]> = new Map();
    const kfMarks: string[][] = [actionInfo.path.firstKfMarks, ...actionInfo.path.kfMarks];
    actionInfo.path.sortedAttrValueComb.forEach((attrValueComb: string, idx: number) => {
        const shape: string = attrValueComb.split(',')[shapeAttrIdx];
        if (typeof shapeMarkMap.get(shape) === 'undefined') {
            shapeMarkMap.set(shape, []);
        }
        shapeMarkMap.get(shape).push(...kfMarks[idx]);
    })

    const animations: IAnimationSpec[] = state.spec.animations;
    for (let i = 0, len = animations.length; i < len; i++) {
        let a: IAnimationSpec = animations[i];
        let insertIdx: number = i;
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            //create multiple animations
            let selectorRecorder: string[] = [];
            [...shapeMarkMap].forEach((shapeMarks: [string, string[]], idx: number) => {
                const newSelector: string = `#${shapeMarks[1].join(', #')}`;
                selectorRecorder.push(...newSelector.split(', '));
                const newAni: IAnimationSpec = {
                    selector: newSelector,
                    effects: a.effects,
                    chartIdx: a.chartIdx
                }
                if (idx === 0) {
                    if (typeof a.reference !== 'undefined') {
                        newAni.reference = a.reference;
                    }
                    if (typeof a.offset !== 'undefined') {
                        newAni.offset = a.offset;
                    }
                    newAni.id = actionInfo.aniId;
                } else {
                    newAni.reference = TimingSpec.timingRef.previousEnd;
                    newAni.align = { target: actionInfo.aniId, type: 'element', merge: true };
                }
                if (actionInfo.path.attrComb.length > 0) {
                    CanisGenerator.createGrouping(newAni, actionInfo.path.attrComb, actionInfo.attrValueSort);
                }
                animations.splice(insertIdx, 0, newAni);
                insertIdx++;
            })

            a.reference = TimingSpec.timingRef.previousEnd;
            CanisGenerator.removeMarksFromSelector(a, selectorRecorder);
            break;
        }
    }
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.SPLIT_CREATE_ONE_ANI, (actionInfo: { aniId: string, newAniSelector: string, attrComb: string[], attrValueSort: string[][] }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    for (let i = 0, len = animations.length; i < len; i++) {
        let a: IAnimationSpec = animations[i];
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            const newAni: IAnimationSpec = {
                selector: actionInfo.newAniSelector,
                effects: a.effects,
                chartIdx: a.chartIdx
            }
            if (typeof a.reference !== 'undefined') {
                newAni.reference = a.reference;
            }
            if (typeof a.offset !== 'undefined') {
                newAni.offset = a.offset;
            }
            if (actionInfo.attrComb.length > 0) {
                CanisGenerator.createGrouping(newAni, actionInfo.attrComb, actionInfo.attrValueSort);
            }
            a.reference = TimingSpec.timingRef.previousEnd;
            CanisGenerator.removeMarksFromSelector(a, actionInfo.newAniSelector.split(', '));
            animations.splice(i, 0, newAni);
            break;
        }
    }
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.APPEND_SPEC_GROUPING, (actionInfo: { aniId: string, attrComb: string[], attrValueSort: string[][] }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    for (let i = 0, len = animations.length; i < len; i++) {
        let a: IAnimationSpec = animations[i];
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.appendGrouping(a, actionInfo.attrComb, actionInfo.attrValueSort);
            break;
        }
    }
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_ALIGN_MERGE, (actionInfo: { aniId: string, merge: boolean }) => {
    const animations: IAnimationSpec[] = state.spec.animations;
    for (let i = 0, len = animations.length; i < len; i++) {
        let a: IAnimationSpec = animations[i];
        if (`${a.chartIdx}_${a.selector}` === actionInfo.aniId) {
            CanisGenerator.updateMerge(a, actionInfo.merge);
            break;
        }
    }
    state.spec = { ...state.spec, animations: animations };
})

Reducer.listen(action.UPDATE_ANI_ALIGN_AFTER_ANI, (actionInfo: { targetAni: string, currentAni: string }) => {
    Reducer.updateAniAlign(action.UPDATE_ANI_ALIGN_AFTER_ANI, actionInfo);
})

Reducer.listen(action.UPDATE_ANI_ALIGN_WITH_ANI, (actionInfo: { targetAni: string, currentAni: string }) => {
    Reducer.updateAniAlign(action.UPDATE_ANI_ALIGN_WITH_ANI, actionInfo);
})

Reducer.listen(action.UPDATE_ANI_ALIGN_AFTER_KF, (actionInfo: { targetAni: string, currentAni: string }) => {
    Reducer.updateAniAlign(action.UPDATE_ANI_ALIGN_AFTER_KF, actionInfo);
})

Reducer.listen(action.UPDATE_ANI_ALIGN_WITH_KF, (actionInfo: { targetAni: string, currentAni: string }) => {
    Reducer.updateAniAlign(action.UPDATE_ANI_ALIGN_WITH_KF, actionInfo);
})
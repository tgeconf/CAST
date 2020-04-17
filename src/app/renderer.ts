import { state, IState, State } from './state'
import { IDataItem, ISortDataAttr, IKeyframeGroup, IKeyframe, IKfGroupSize, IPath } from './core/ds'
import { ChartSpec, Animation } from 'canis_toolkit'
import CanisGenerator, { canis, ICanisSpec } from './core/canisGenerator'
import { ViewToolBtn, ViewContent } from '../components/viewWindow'
import AttrBtn from '../components/widgets/attrBtn'
import AttrSort from '../components/widgets/attrSort'
import Util from './core/util'
import Reducer from './reducer'
import * as action from './action'
import SelectableTable from '../components/widgets/selectableTable'
import Lottie, { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie'
import { Player, player } from '../components/player'


/** for test!!!!!!!!!!!!!!!!!!!!!!!!! */
import testSpec from '../assets/tmp/testSpec.json'
import KfItem from '../components/widgets/kfItem'
import KfTrack from '../components/widgets/kfTrack'
import KfGroup from '../components/widgets/kfGroup'
import { KfContainer, kfContainer } from '../components/kfContainer'
import KfOmit from '../components/widgets/kfOmit'
import PlusBtn from '../components/widgets/plusBtn'
import Suggest from './core/suggest'
import Tool from '../util/tool'
import { suggestBox, SuggestBox } from '../components/widgets/suggestBox'
/** end for test!!!!!!!!!!!!!!!!!!!!!!!!! */

/**
 * render html according to the state
 */
export default class Renderer {
    /**
     * test rendering spec
     * @param spec 
     */
    public static async renderSpec(spec: ICanisSpec) {
        console.log('going to render spec: ', spec);
        const lottieSpec = await canis.renderSpec(spec, () => {
            Util.extractAttrValueAndDeterminType(ChartSpec.dataMarkDatum);
            Util.extractNonDataAttrValue(ChartSpec.nonDataMarkDatum);

            //save histroy before update state
            State.tmpStateBusket.push([action.UPDATE_DATA_ORDER, state.dataOrder]);
            State.tmpStateBusket.push([action.UPDATE_DATA_TABLE, state.dataTable]);
            State.tmpStateBusket.push([action.UPDATE_DATA_SORT, state.sortDataAttrs]);
            Reducer.triger(action.UPDATE_DATA_ORDER, Array.from(Util.filteredDataTable.keys()));
            Reducer.triger(action.UPDATE_DATA_TABLE, Util.filteredDataTable);
            Reducer.triger(action.UPDATE_DATA_SORT, Object.keys(Util.attrType).map(attrName => {
                return {
                    attr: attrName,
                    sort: 'dataIndex'
                }
            }));

            if (spec.animations[0].selector === '.mark') {
                Reducer.triger(action.UPDATE_SPEC_SELECTOR, { aniId: `${spec.animations[0].chartIdx}_${spec.animations[0].selector}`, selector: `#${Animation.allMarks.join(', #')}` });
            }
        });
        //add highlight box on the chart
        const svg: HTMLElement = document.getElementById('visChart');
        if (svg) {
            //create the highlight box
            const highlightBox: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            highlightBox.setAttributeNS(null, 'id', 'highlightSelectionFrame');
            highlightBox.setAttributeNS(null, 'class', 'highlight-selection-frame');
            highlightBox.setAttributeNS(null, 'fill', 'rgba(255, 255, 255, 0.01)');
            highlightBox.setAttributeNS(null, 'stroke', '#2196f3');
            highlightBox.setAttributeNS(null, 'stroke-width', '2');
            svg.appendChild(highlightBox);
        }
        //render video view
        this.renderVideo(lottieSpec);
        player.resetPlayer({
            frameRate: canis.frameRate,
            currentTime: 0,
            totalTime: canis.duration()
        })
    }

    public static renderVideo(lottieSpec: any): void {
        document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID).innerHTML = '';
        //save histroy before update state
        State.tmpStateBusket.push([action.UPDATE_LOTTIE, state.lottieAni]);
        State.saveHistory();
        Lottie.destroy();
        Reducer.triger(action.UPDATE_LOTTIE, Lottie.loadAnimation({
            container: document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID),
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: lottieSpec // the animation data
        }));
        //start to play animation
        document.getElementById(Player.PLAY_BTN_ID).click();

        //filter out the static marks
        const animatedMarks: string[] = Array.from(Animation.allMarkAni.keys());
        const staticMarks: string[] = [];
        Animation.allMarks.forEach((mId: string) => {
            if (!animatedMarks.includes(mId)) {
                staticMarks.push(mId);
            }
        });

        Reducer.triger(action.UPDATE_STATIC_KEYFRAME, staticMarks);
        Reducer.triger(action.UPDATE_KEYFRAME_TRACKS, Animation.animations);
    }

    public static renderKfContainerSliders(kfgSize: IKfGroupSize) {
        //reset the transform of kfcontainer
        kfContainer.resetContainerTrans();
        kfContainer.updateKfSlider(kfgSize);
    }

    public static renderStaticKf(staticMarks: string[]) {
        //reset
        //TODO: need to check performance
        document.getElementById(KfContainer.KF_BG).innerHTML = '';
        document.getElementById(KfContainer.KF_FG).innerHTML = '';
        const placeHolder: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        placeHolder.setAttributeNS(null, 'width', '1');
        placeHolder.setAttributeNS(null, 'height', '18');
        placeHolder.setAttributeNS(null, 'fill', '#00000000');
        document.getElementById(KfContainer.KF_FG).appendChild(placeHolder);
        KfTrack.reset();
        KfGroup.reset();
        KfOmit.reset();

        const firstTrack: KfTrack = new KfTrack();
        firstTrack.createTrack();
        // const staticKf: KfItem = new KfItem();
        // staticKf.createStaticItem(staticMarks);
        // firstTrack.container.appendChild(staticKf.container);
    }

    public static renderKeyframeTracks(kfgs: IKeyframeGroup[]): void {
        // let groupTrackMapping: Map<string, KfTrack[]> = new Map();//key: aniId, value: track id array
        kfgs.forEach((kfg: IKeyframeGroup) => {
            KfGroup.leafLevel = 0;
            let treeLevel = 0;//use this to decide the background color of each group
            //top-down to init group and kf
            const rootGroup: KfGroup = this.renderKeyframeGroup(0, 1, kfg, treeLevel);
            //bottom-up to update size and position
            rootGroup.updateGroupPosiAndSize([...KfTrack.aniTrackMapping.get(rootGroup.aniId)][0].availableInsert, 0, false, true);
            KfGroup.allAniGroups.set(rootGroup.aniId, rootGroup);
        })
        const rootGroupBBox: DOMRect = document.getElementById(KfContainer.KF_FG).getBoundingClientRect();
        Reducer.triger(action.UPDATE_KEYFRAME_CONTAINER_SLIDER, { width: rootGroupBBox.width, height: rootGroupBBox.height });
    }

    public static renderKeyframeGroup(kfgIdx: number, totalKfgNum: number, kfg: IKeyframeGroup, treeLevel: number, parentObj?: KfGroup): KfGroup {
        //draw group container
        let kfGroup: KfGroup = new KfGroup();
        if (kfgIdx === 0 || kfgIdx === 1 || kfgIdx === totalKfgNum - 1) {
            let targetTrack: KfTrack; //foreground of the track used to put the keyframe group
            if (kfg.newTrack) {
                //judge whether the new track is already in this animation
                if (typeof parentObj !== 'undefined') {
                    let lastChild: KfGroup;
                    for (let i = parentObj.children.length - 1; i >= 0; i--) {
                        if (parentObj.children[i] instanceof KfGroup) {
                            lastChild = parentObj.children[i];
                            break;
                        }
                    }
                    let allTracksThisAni: KfTrack[] = [...KfTrack.aniTrackMapping.get(kfg.aniId)];
                    let lastTrack: KfTrack = KfTrack.allTracks.get(lastChild.targetTrackId);
                    if (typeof lastTrack !== 'undefined') {
                        allTracksThisAni.forEach((kft: KfTrack) => {
                            if (kft.trackPosiY - lastTrack.trackPosiY > 0 && kft.trackPosiY - lastTrack.trackPosiY <= KfTrack.TRACK_HEIGHT) {
                                targetTrack = kft;
                            }
                        })
                    }
                    if (typeof targetTrack === 'undefined') {
                        targetTrack = new KfTrack();
                        let createFakeTrack: boolean = false;
                        if (typeof kfg.merge !== 'undefined') {
                            createFakeTrack = kfg.merge;
                        }
                        targetTrack.createTrack(createFakeTrack);
                    }
                } else {
                    targetTrack = new KfTrack();
                    let createFakeTrack: boolean = false;
                    if (typeof kfg.merge !== 'undefined') {
                        createFakeTrack = kfg.merge;
                    }
                    targetTrack.createTrack(createFakeTrack);
                }
            } else {
                if (typeof KfTrack.aniTrackMapping.get(kfg.aniId) !== 'undefined') {
                    targetTrack = [...KfTrack.aniTrackMapping.get(kfg.aniId)][0];//this is the group within an existing animation
                } else {
                    //target track is the last track
                    let maxTrackPosiY: number = 0;
                    KfTrack.allTracks.forEach((kft: KfTrack, trackId: string) => {
                        if (kft.trackPosiY >= maxTrackPosiY) {
                            maxTrackPosiY = kft.trackPosiY;
                            targetTrack = kft;
                        }
                    })
                }
            }
            if (typeof KfTrack.aniTrackMapping.get(kfg.aniId) === 'undefined') {
                KfTrack.aniTrackMapping.set(kfg.aniId, new Set());
            }
            KfTrack.aniTrackMapping.get(kfg.aniId).add(targetTrack);
            let minTrackPosiYThisGroup: number = [...KfTrack.aniTrackMapping.get(kfg.aniId)][0].trackPosiY;

            console.log('target track: ', targetTrack, minTrackPosiYThisGroup);
            //check whether this is the group of animation, and whether to add a plus button or not
            let plusBtn: PlusBtn, addedPlusBtn: boolean = false;
            if (treeLevel === 0) {//this is the root group
                //find the keyframes of the first group
                const tmpKfs: IKeyframe[] = Util.findFirstKfs(kfg);
                let [addingPlusBtn, acceptableMarkClasses] = PlusBtn.detectAdding(tmpKfs);
                if (addingPlusBtn) {
                    addedPlusBtn = addingPlusBtn;
                    plusBtn = new PlusBtn()
                    plusBtn.createBtn(kfGroup, tmpKfs, targetTrack, targetTrack.availableInsert, { w: KfItem.KF_WIDTH - KfItem.KF_W_STEP, h: KfItem.KF_HEIGHT - 2 * KfItem.KF_H_STEP }, acceptableMarkClasses);
                    targetTrack.availableInsert += PlusBtn.PADDING * 4 + PlusBtn.BTN_SIZE;
                }
            }
            console.log('all ani groups: ', KfGroup.allAniGroups);
            kfGroup.createGroup(kfg, parentObj ? parentObj : targetTrack, targetTrack.trackPosiY - minTrackPosiYThisGroup, treeLevel, targetTrack.trackId);
            if (treeLevel === 0 && addedPlusBtn) {
                plusBtn.fakeKfg.marks = kfGroup.marks;
                plusBtn.fakeKfg.aniId = kfGroup.aniId;
            }
        } else if (totalKfgNum > 3 && kfgIdx === totalKfgNum - 2) {
            let kfOmit: KfOmit = new KfOmit();
            kfOmit.createOmit(0, 0, parentObj, false, false);
            parentObj.children.push(kfOmit);//why comment this out!!!!
            parentObj.kfOmits.push(kfOmit);
        }

        treeLevel++;
        if (treeLevel > KfGroup.leafLevel) {
            KfGroup.leafLevel = treeLevel;
        }
        if (kfg.keyframes.length > 0) {
            kfGroup.kfNum = kfg.keyframes.length;
            //choose the keyframes to draw
            let alignWithAnis: Map<string, number[]> = new Map();
            let alignToAni: number[] = [];
            kfg.keyframes.forEach((k: any, i: number) => {
                if (typeof k.alignWith !== 'undefined') {
                    k.alignWith.forEach((aniId: string) => {
                        if (typeof alignWithAnis.get(aniId) === 'undefined') {
                            alignWithAnis.set(aniId, [100000, 0]);
                        }
                        if (i < alignWithAnis.get(aniId)[0]) {
                            alignWithAnis.get(aniId)[0] = i;
                        }
                        if (i > alignWithAnis.get(aniId)[1]) {
                            alignWithAnis.get(aniId)[1] = i;
                        }
                    })
                } else if (typeof k.alignTo !== 'undefined') {
                    if (typeof KfItem.allKfItems.get(k.alignTo) !== 'undefined') {
                        if (KfItem.allKfItems.get(k.alignTo).rendered) {
                            alignToAni.push(i);
                        }
                    }
                }
            })
            let kfIdxToDraw: number[] = [0, 1, kfg.keyframes.length - 1];
            let isAlignWith: number = 0;//0 -> neither align with nor align to, 1 -> align with, 2 -> align to 

            //this group is the align target
            if (alignWithAnis.size > 0) {
                isAlignWith = 1;
                alignWithAnis.forEach((se: number[], aniId: string) => {
                    kfIdxToDraw.push(se[0]);
                    kfIdxToDraw.push(se[1]);
                    if (se[0] + 1 < se[1]) {
                        kfIdxToDraw.push(se[0] + 1);
                    }
                })
            } else if (alignToAni.length > 0) {
                //this group aligns to other group
                isAlignWith = 2;
                kfIdxToDraw = [...kfIdxToDraw, ...alignToAni];
            }
            kfIdxToDraw = [...new Set(kfIdxToDraw)].sort((a: number, b: number) => a - b);

            //rendering kf
            //check whether there should be a plus btn
            let kfPosiX = kfGroup.offsetWidth;
            kfg.keyframes.forEach((k: any, i: number) => {
                //whether to draw this kf or not
                if (kfIdxToDraw.includes(i)) {
                    //whether to draw '...'
                    if (i > 0 && kfIdxToDraw[kfIdxToDraw.indexOf(i) - 1] !== i - 1) {
                        const omitNum: number = i - kfIdxToDraw[kfIdxToDraw.indexOf(i) - 1] - 1;
                        if (omitNum > 0) {
                            const kfOmit: KfOmit = new KfOmit();
                            kfOmit.createOmit(kfPosiX, omitNum, kfGroup, kfg.keyframes[1].delayIcon, kfg.keyframes[1].durationIcon, kfGroup.children[1].kfHeight / 2);
                            kfGroup.children.push(kfOmit);
                            kfGroup.kfOmits.push(kfOmit);
                            kfPosiX += KfOmit.OMIT_W;
                        }
                    }
                    //draw render
                    const kfItem: KfItem = new KfItem();
                    let targetSize: { w: number, h: number } = { w: 0, h: 0 }
                    if (isAlignWith === 2) {
                        const alignedKf: DOMRect = KfItem.allKfItems.get(k.alignTo).kfBg.getBoundingClientRect();
                        targetSize.w = alignedKf.width;
                        targetSize.h = alignedKf.height;
                        kfItem.createItem(k, treeLevel, kfGroup, kfPosiX, targetSize);
                    } else {
                        kfItem.createItem(k, treeLevel, kfGroup, kfPosiX);
                    }

                    // KfItem.allKfItems.set(k.id, kfItem);
                    kfGroup.children.push(kfItem);
                    kfItem.idxInGroup = kfGroup.children.length - 1;
                    kfPosiX += kfItem.totalWidth;
                }
            })
        } else if (kfg.children.length > 0) {
            //rendering kf group
            kfg.children.forEach((c: any, i: number) => {
                const tmpKfGroup: KfGroup = this.renderKeyframeGroup(i, kfg.children.length, c, treeLevel, kfGroup);
                kfGroup.children.push(tmpKfGroup);
                tmpKfGroup.idxInGroup = kfGroup.children.length - 1;
                kfGroup.kfNum += tmpKfGroup.kfNum;
            });
        }
        return kfGroup;
    }

    public static renderDataAttrs(sdaArr: ISortDataAttr[]): void {
        if (sdaArr.length > 0) {
            document.getElementById('attrBtnContainer').innerHTML = '';
            document.getElementById('sortInputContainer').innerHTML = '';
            sdaArr.forEach(sda => {
                const attrBtn: AttrBtn = new AttrBtn();
                attrBtn.createAttrBtn(sda.attr);
                document.getElementById('attrBtnContainer').appendChild(attrBtn.btn);
                const attrSort: AttrSort = new AttrSort();
                attrSort.createAttrSort(sda.attr);
                document.getElementById('sortInputContainer').appendChild(attrSort.selectInput);
            })
        }
    }

    public static renderDataTable(dt: Map<string, IDataItem>): void {
        if (dt.size > 0) {
            const dataTable: SelectableTable = new SelectableTable();
            document.getElementById('dataTabelContainer').innerHTML = '';
            document.getElementById('dataTabelContainer').appendChild(dataTable.createTable(dt));
            SelectableTable.renderSelection(state.selection);
        }
    }

    /**
     * set the selection tool status
     * @param t 
     */
    public static renderChartTool(t: string): void {
        switch (t) {
            case ViewToolBtn.SINGLE:
                (<HTMLElement>document.getElementsByClassName('arrow-icon')[0]).click();
                break;
            case ViewToolBtn.LASSO:
                (<HTMLElement>document.getElementsByClassName('lasso-icon')[0]).click();
                break;
            case ViewToolBtn.DATA:
                (<HTMLElement>document.getElementsByClassName('table-icon')[0]).click();
                break;
        }
    }

    /**
     * set the style of the selected marks and the highlight box
     * @param selection 
     */
    public static renderSelectedMarks(selection: string[]): void {
        let highlightSelectionBox: HTMLElement = document.getElementById('highlightSelectionFrame');
        //highlight selection in data table
        SelectableTable.renderSelection(selection);
        if (selection.length === 0) {//no mark is selected
            if (highlightSelectionBox) {
                //reset highlightselectionbox
                highlightSelectionBox.setAttributeNS(null, 'x', '0');
                highlightSelectionBox.setAttributeNS(null, 'y', '0');
                highlightSelectionBox.setAttributeNS(null, 'width', '0');
                highlightSelectionBox.setAttributeNS(null, 'height', '0');
            }
            //reset all marks to un-selected
            Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => m.classList.remove('non-framed-mark'))
        } else {
            //find the boundary of the selected marks
            let minX = 10000, minY = 10000, maxX = -10000, maxY = -10000;
            Array.from(document.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
                const markId: string = m.id;
                if (selection.includes(markId)) {//this is a selected mark
                    m.classList.remove('non-framed-mark');
                    const tmpBBox = (<SVGGraphicsElement><unknown>m).getBBox();
                    minX = tmpBBox.x < minX ? tmpBBox.x : minX;
                    minY = tmpBBox.y < minY ? tmpBBox.y : minY;
                    maxX = tmpBBox.x + tmpBBox.width > maxX ? (tmpBBox.x + tmpBBox.width) : maxX;
                    maxY = tmpBBox.y + tmpBBox.height > maxY ? (tmpBBox.y + tmpBBox.height) : maxY;
                } else {//this is not a selected mark
                    m.classList.add('non-framed-mark');
                }
            })
            if (highlightSelectionBox) {
                //set the highlightSelectionFrame
                highlightSelectionBox.setAttributeNS(null, 'x', (minX - 5).toString());
                highlightSelectionBox.setAttributeNS(null, 'y', (minY - 5).toString());
                highlightSelectionBox.setAttributeNS(null, 'width', (maxX - minX + 10).toString());
                highlightSelectionBox.setAttributeNS(null, 'height', (maxY - minY + 10).toString());
            }
        }

    }

    public static renderSuggestKfs(kfIdxInPath: number, startKf: KfItem, suggestOnFirstKf: boolean, selectedMarks: string[]) {
        const nextUniqueKfIdx: number = Suggest.findNextUniqueKf(state.allPaths, kfIdxInPath);
        if (nextUniqueKfIdx === -1) {//render groups
            const targetPath: IPath = state.allPaths[0];

            if (typeof targetPath === 'undefined') {
                //create one animation
                Reducer.triger(action.SPLIT_CREATE_ONE_ANI, { aniId: startKf.aniId, newAniSelector: `#${selectedMarks.join(', #')}`, attrComb: [], attrValueSort: [] });
            } else {
                //extract attr value order
                const attrValueSort: string[][] = Util.extractAttrValueOrder(targetPath.sortedAttrValueComb);
                const clsOfMarksInPath: string[] = Util.extractClsFromMarks(targetPath.lastKfMarks);
                const clsOfMarksThisAni: string[] = Util.extractClsFromMarks(startKf.parentObj.marksThisAni());

                if (!suggestOnFirstKf) {//the suggestion is based on all marks in this animation as the last kf
                    if (Tool.identicalArrays(clsOfMarksInPath, clsOfMarksThisAni)) {//marks in current path have the same classes as those in current animation 
                        if (clsOfMarksInPath.length > 1) {//create multiple animations
                            console.log('same cls have different kinds of marks: ', targetPath.attrComb, attrValueSort);
                        } else {//create grouping
                            Reducer.triger(action.UPDATE_SPEC_GROUPING, { aniId: startKf.aniId, attrComb: targetPath.attrComb, attrValueSort: attrValueSort });
                        }
                    } else {//marks in current path don't have the same classes as those in current animation 
                        if (clsOfMarksInPath.length > 1) {//create multiple animations
                            console.log('diff cls have different kinds of marks: ', targetPath.attrComb, attrValueSort);
                        } else {//create one animation
                            Reducer.triger(action.SPLIT_CREATE_ONE_ANI, { aniId: startKf.aniId, newAniSelector: `#${targetPath.lastKfMarks.join(', #')}`, attrComb: targetPath.attrComb, attrValueSort: attrValueSort });
                        }
                    }
                } else {//the suggestion is based on all marks in current first  kf as the last kf
                    if (clsOfMarksInPath.length > 1) {//change timing of marks of different classes
                        console.log('diff cls first kf as last: ', targetPath.attrComb, attrValueSort);
                    } else {//append grouping to current animation
                        Reducer.triger(action.APPEND_SPEC_GROUPING, { aniId: startKf.aniId, attrComb: targetPath.attrComb, attrValueSort: attrValueSort })
                    }
                }
            }
        } else {//there are still multiple paths
            let insertIdx: number = 0;
            for (let j = 0, len = startKf.parentObj.children.length; j < len; j++) {
                if (startKf.parentObj.children[j] instanceof KfItem && startKf.parentObj.children[j].id === startKf.id) {
                    insertIdx = j + 1;
                    break;
                }
            }
            const nextKf: KfItem = startKf.parentObj.children[insertIdx];

            let kfBeforeSuggestBox: KfItem = startKf;
            const numKfToRender: number = nextUniqueKfIdx - kfIdxInPath - 1;
            let transX: number = 0;
            let lastKf: KfItem;
            for (let i = 0; i < numKfToRender; i++) {
                if (i === 0 || i === numKfToRender - 1) {
                    if (i === numKfToRender - 1 && numKfToRender > 2) {//render omit first
                        const kfOmit: KfOmit = new KfOmit();
                        const omitStartX: number = Tool.extractTransNums(startKf.container.getAttributeNS(null, 'transform')).x + startKf.kfWidth + transX;
                        kfOmit.createOmit(omitStartX, numKfToRender - 2, startKf.parentObj, false, true, startKf.kfHeight / 2);
                        startKf.parentObj.children.push(kfOmit);
                        startKf.parentObj.kfOmits.push(kfOmit);
                        insertIdx++;
                        transX += KfOmit.OMIT_W + 2 * KfItem.PADDING;
                    }
                    //render kf
                    const startKfInfo: IKeyframe = KfItem.allKfInfo.get(startKf.id);
                    const tmpKfInfo: IKeyframe = KfItem.createKfInfo(state.allPaths[0].kfMarks[kfIdxInPath + 1 + i],
                        {
                            duration: startKfInfo.duration,
                            allCurrentMarks: startKfInfo.allCurrentMarks,
                            allGroupMarks: startKfInfo.allGroupMarks
                        });
                    KfItem.allKfInfo.set(tmpKfInfo.id, tmpKfInfo);
                    let tmpKf: KfItem = new KfItem();
                    const startX: number = Tool.extractTransNums(startKf.container.getAttributeNS(null, 'transform')).x + startKf.totalWidth + transX - KfGroup.PADDING;
                    tmpKf.createItem(tmpKfInfo, startKf.parentObj.treeLevel + 1, startKf.parentObj, startX);
                    lastKf = tmpKf;
                    startKf.parentObj.children.splice(insertIdx, 0, tmpKf);
                    insertIdx++;
                    transX += tmpKf.totalWidth;
                    kfBeforeSuggestBox = tmpKf;
                }
            }
            //render suggestion box
            suggestBox.createSuggestBox(kfBeforeSuggestBox, nextUniqueKfIdx, suggestOnFirstKf);
            transX += (suggestBox.boxWidth + 3 * SuggestBox.PADDING + suggestBox.menuWidth + 2);

            //translate the ori group
            if (typeof nextKf === 'undefined') {
                let transStartKf: KfItem = typeof lastKf === 'undefined' ? startKf : lastKf;
                startKf.parentObj.translateGroup(transStartKf, transX, false, false, false, { lastItem: true, extraWidth: suggestBox.boxWidth + SuggestBox.PADDING + suggestBox.menuWidth });
            } else {
                startKf.parentObj.translateGroup(nextKf, transX, false, false, false);
            }
        }
    }
}
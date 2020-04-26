import '../../assets/style/keyframeItem.scss'
import Tool from '../../util/tool'
import { IKeyframe } from '../../app/core/ds';
import KfGroup from './kfGroup';
import KfTimingIllus from './kfTimingIllus';
import KfOmit from './kfOmit';
import { ICoord, ISize } from '../../util/ds';
import IntelliRefLine from './intelliRefLine';
import { KfContainer } from '../kfContainer';
import * as action from '../../app/action';
import Reducer from '../../app/reducer';
import { TimingSpec } from 'canis_toolkit';
import { state } from '../../app/state';
import KfTrack from './kfTrack';

export default class KfItem extends KfTimingIllus {
    static KF_HEIGHT: number = 178;
    static KF_WIDTH: number = 240;
    static KF_H_STEP: number = 6;
    static KF_W_STEP: number = 8;
    static PADDING: number = 6;
    static STATIC_KF_ID: number = -100;
    static FRAME_COLOR: string = '#676767';
    static allKfInfo: Map<number, IKeyframe> = new Map();//contains both fake and real info
    static allKfItems: Map<number, KfItem> = new Map();//contains both fake and real kf
    static staticKf: KfItem;
    static dragoverKf: KfItem;
    static fakeKfIdx: number = 10000;

    // public id: number;
    public treeLevel: number;
    public parentObj: KfGroup;
    public rendered: boolean = false;
    public idxInGroup: number = 0;
    public isHighlighted: boolean = false;
    public kfInfo: {
        delay: number
        duration: number
        allCurrentMarks: string[]
        allGroupMarks: string[]
        marksThisKf: string[]
        alignTo?: number
    }

    //widgets
    // public container: SVGGElement
    public kfHeight: number
    public kfBg: SVGRectElement
    public kfWidth: number
    public alignFrame: SVGRectElement
    public totalWidth: number = 0
    public chartThumbnail: SVGImageElement

    set offsetDiff(od: number) {
        this._offsetDiff = od;
        Tool.transNodeElements(this.container, od, true);
        this.parentObj.translateGroup(this, od, true, false, true);
    }

    get offsetDiff(): number {
        return this._offsetDiff;
    }

    set durationDiff(dd: number) {
        this._durationDiff = dd;
        // this.transNextKf(df);
        // this.parentObj.translateGroup(this, df, true, { lastItem: true, extraWidth: 0 });
        this.parentObj.translateGroup(this, dd, true, false, true);

    }

    get durationDiff(): number {
        return this._durationDiff;
    }

    public static highlightKfs(selectedCls: string[]) {
        //highlight static kf
        // if (typeof KfItem.staticKf !== 'undefined') {
        //     KfItem.staticKf.highlightKf();
        // }
        //filter which kf to highlight
    }

    public static cancelHighlightKfs() {
        this.allKfItems.forEach((kf: KfItem) => {
            if (kf.isHighlighted) {
                kf.cancelHighlightKf();
            }
        })
    }

    public static createKfInfo(selectedMarks: string[], basicInfo: { duration: number, allCurrentMarks: string[], allGroupMarks: string[] }): IKeyframe {
        KfItem.fakeKfIdx++;
        return {
            id: KfItem.fakeKfIdx,
            timingRef: TimingSpec.timingRef.previousEnd,
            duration: basicInfo.duration,
            allCurrentMarks: basicInfo.allCurrentMarks,
            allGroupMarks: basicInfo.allGroupMarks,
            marksThisKf: selectedMarks,
            durationIcon: true,
            hiddenDurationIcon: false,
            delay: 0,
            delayIcon: false
        }
    }

    // public createStaticItem(staticMarks: string[]): void {
    //     this.id = KfItem.STATIC_KF_ID;
    //     this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //     this.container.setAttributeNS(null, 'transform', `translate(${KfItem.PADDING}, ${KfItem.PADDING})`);
    //     this.kfHeight = KfItem.KF_HEIGHT - 2 * KfItem.PADDING;
    //     this.drawKfBg(0);
    //     this.container.appendChild(this.kfBg);
    //     if (staticMarks.length > 0) {
    //         this.drawStaticChart(staticMarks);
    //         this.container.appendChild(this.chartThumbnail);
    //     }
    //     KfItem.staticKf = this;
    // }

    public createOptionKfItem(allCurrentMarks: string[], allGroupMarks: string[], marksThisKf: string[], kfWidth: number, kfHeight: number) {
        this.kfWidth = kfWidth;
        this.kfHeight = kfHeight;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${KfItem.PADDING}, ${KfItem.PADDING})`);
        this.drawKfBg(-1, { w: kfWidth, h: kfHeight });
        this.container.appendChild(this.kfBg);
        this.drawChart(allCurrentMarks, allGroupMarks, marksThisKf);
        this.container.appendChild(this.chartThumbnail);
    }

    public createItem(kf: IKeyframe, treeLevel: number, parentObj: KfGroup, startX: number, size?: ISize): void {
        this.hasOffset = kf.delayIcon;
        this.hasDuration = kf.durationIcon;
        this.hasHiddenDuration = kf.hiddenDurationIcon;
        this.parentObj = parentObj;
        this.aniId = this.parentObj.aniId;
        if (this.parentObj.kfHasOffset !== this.hasOffset || this.parentObj.kfHasDuration !== this.hasDuration) {
            this.parentObj.updateParentKfHasTiming(this.hasOffset, this.hasDuration);
        }
        this.id = kf.id;
        this.treeLevel = treeLevel;

        if (typeof size !== 'undefined') {
            console.log('alignto level: ', treeLevel);
            this.kfHeight = size.h;
        } else {
            this.kfHeight = KfItem.KF_HEIGHT - 2 * treeLevel * KfItem.KF_H_STEP;
        }
        this.kfInfo = {
            delay: kf.delay,
            duration: kf.duration,
            allCurrentMarks: kf.allCurrentMarks,
            allGroupMarks: kf.allGroupMarks,
            marksThisKf: kf.marksThisKf,
        }
        if (typeof kf.alignTo !== 'undefined') {
            this.kfInfo.alignTo = kf.alignTo;
        }
        if (typeof parentObj.container !== 'undefined') {
            this.rendered = true;
            this.renderItem(startX, size);
            if (typeof this.kfInfo.alignTo !== 'undefined') {//this kf is align to others
                const aniGroup: KfGroup = this.parentObj.fetchAniGroup();
                if (aniGroup.alignMerge) {
                    this.showAlignFrame();
                }
            }
        } else {
            KfItem.allKfItems.set(this.id, this);
        }
    }

    public renderItem(startX: number, size?: ISize) {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.classList.add('draggable-component');
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfItem.PADDING}, ${KfItem.PADDING})`);
        if (typeof this.kfInfo.alignTo !== 'undefined') {//this kf is align to others
            const aniGroup: KfGroup = this.parentObj.fetchAniGroup();
            this.container.onmouseover = () => {
                if (!state.mousemoving) {
                    aniGroup.transShowTitle();
                }
            }
            this.container.onmouseout = () => {
                aniGroup.transHideTitle();
            }
        }
        this.container.onmousedown = (downEvt) => {
            Reducer.triger(action.UPDATE_MOUSE_MOVING, true);
            let oriMousePosi: ICoord = { x: downEvt.pageX, y: downEvt.pageY };
            const targetMoveItem: KfGroup | KfItem = typeof this.kfInfo.alignTo !== 'undefined' ? this.parentObj.fetchAniGroup() : this;
            //move the entire group
            // const aniGroup: KfGroup = this.parentObj.fetchAniGroup();
            targetMoveItem.container.setAttributeNS(null, '_transform', targetMoveItem.container.getAttributeNS(null, 'transform'));
            const containerBBox: DOMRect = targetMoveItem.container.getBoundingClientRect();
            if (targetMoveItem.parentObj.container.contains(targetMoveItem.container)) {
                targetMoveItem.parentObj.container.removeChild(targetMoveItem.container);
            }
            const popKfContainer: HTMLElement = document.getElementById(KfContainer.KF_POPUP);
            const popKfContainerBbox: DOMRect = popKfContainer.getBoundingClientRect();
            popKfContainer.appendChild(targetMoveItem.container);
            //set new transform
            targetMoveItem.container.setAttributeNS(null, 'transform', `translate(${containerBBox.left - popKfContainerBbox.left}, ${containerBBox.top - popKfContainerBbox.top})`);

            let updateSpec: boolean = false;
            let actionType: string = '';
            let actionInfo: any = {};
            if (targetMoveItem instanceof KfGroup) {//this kf is align to others
                //find all kfs in this kfgroup
                const allKfItems: KfItem[] = targetMoveItem.fetchAllKfs();

                //set visible
                targetMoveItem.showGroupBg();
                targetMoveItem.hideTitle();
                targetMoveItem.hideMenu();
                document.onmousemove = (moveEvt) => {
                    const alignWithGroupBBox: DOMRect = targetMoveItem.fetchAlignWithGroup().container.getBoundingClientRect();
                    const currentMousePosi: ICoord = { x: moveEvt.pageX, y: moveEvt.pageY };
                    const posiDiff: ICoord = { x: currentMousePosi.x - oriMousePosi.x, y: currentMousePosi.y - oriMousePosi.y };
                    const oriTrans: ICoord = Tool.extractTransNums(targetMoveItem.container.getAttributeNS(null, 'transform'));
                    targetMoveItem.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x}, ${oriTrans.y + posiDiff.y})`);

                    const currentBBox: DOMRect = targetMoveItem.container.getBoundingClientRect();
                    if (currentBBox.top - alignWithGroupBBox.top <= KfTrack.TRACK_HEIGHT * 0.6 && currentBBox.top - alignWithGroupBBox.top >= 0) {//set merge to true
                        //change ref line to align frame
                        allKfItems.forEach((kf: KfItem) => {
                            kf.showAlignFrame();
                            if (typeof IntelliRefLine.kfLineMapping.get(kf.id) !== 'undefined') {
                                const corresRefLine: IntelliRefLine = IntelliRefLine.allLines.get(IntelliRefLine.kfLineMapping.get(kf.id).lineId);
                                if (typeof corresRefLine !== 'undefined') {
                                    corresRefLine.hideLine();
                                }
                            }
                        })
                        //triger action
                        if (targetMoveItem.alignMerge) {
                            updateSpec = false;
                        } else {
                            updateSpec = true;
                            actionType = action.UPDATE_ALIGN_MERGE;
                            actionInfo = { aniId: this.aniId, merge: true }
                        }
                    } else if (currentBBox.top - alignWithGroupBBox.top >= KfTrack.TRACK_HEIGHT * 0.6) {//set merge to false
                        //change align frame to ref line
                        allKfItems.forEach((kf: KfItem) => {
                            kf.hideAlignFrame();
                            if (typeof IntelliRefLine.kfLineMapping.get(kf.id) !== 'undefined') {
                                const corresRefLine: IntelliRefLine = IntelliRefLine.allLines.get(IntelliRefLine.kfLineMapping.get(kf.id).lineId);
                                if (typeof corresRefLine !== 'undefined') {
                                    corresRefLine.showLine();
                                }
                            }
                        })
                        //triger action
                        if (targetMoveItem.alignMerge) {
                            updateSpec = true;
                            actionType = action.UPDATE_ALIGN_MERGE;
                            actionInfo = { aniId: this.aniId, merge: false }
                        } else {
                            updateSpec = false;
                        }
                    }

                    oriMousePosi = currentMousePosi;
                }
                document.onmouseup = () => {
                    document.onmousemove = null;
                    document.onmouseup = null;
                    Reducer.triger(action.UPDATE_MOUSE_MOVING, false);
                    if (!updateSpec) {
                        targetMoveItem.container.setAttributeNS(null, 'transform', targetMoveItem.container.getAttributeNS(null, '_transform'));
                        targetMoveItem.parentObj.container.appendChild(targetMoveItem.container);
                        if (targetMoveItem.alignMerge) {
                            targetMoveItem.hideGroupBg();
                            targetMoveItem.showTitle();
                        } else {
                            targetMoveItem.rerenderGroupBg();
                            targetMoveItem.showTitle();
                            targetMoveItem.showMenu();
                        }
                    } else {
                        Reducer.triger(actionType, actionInfo);
                        popKfContainer.removeChild(targetMoveItem.container);
                    }
                }
            } else {//this kf is not aligned to others
                document.onmousemove = (moveEvt) => {
                    const currentMousePosi: ICoord = { x: moveEvt.pageX, y: moveEvt.pageY };
                    const posiDiff: ICoord = { x: currentMousePosi.x - oriMousePosi.x, y: currentMousePosi.y - oriMousePosi.y };
                    const oriTrans: ICoord = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform'));
                    this.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x + posiDiff.x}, ${oriTrans.y + posiDiff.y})`);
                    const preSibling: KfItem | KfOmit = this.parentObj.children[this.idxInGroup - 1];
                    if (this.idxInGroup > 0 && preSibling instanceof KfItem) {//this is not the first kf in group, need to check the position relation with previous kf
                        const currentKfLeft: number = this.kfBg.getBoundingClientRect().left;
                        const preKfRight: number = preSibling.kfBg.getBoundingClientRect().right;
                        const posiDiff: number = currentKfLeft - preKfRight;
                        const currentKfOffsetW: number = KfItem.BASIC_OFFSET_DURATION_W > this.offsetWidth ? KfItem.BASIC_OFFSET_DURATION_W : this.offsetWidth;
                        const preKfDurationW: number = KfItem.BASIC_OFFSET_DURATION_W > this.durationWidth ? KfItem.BASIC_OFFSET_DURATION_W : this.durationWidth;
                        if (posiDiff >= currentKfOffsetW + preKfDurationW) {//show both pre duration and current offset
                            preSibling.cancelKfDragoverKf();
                            if (this.hasOffset) {
                                this.showOffset();
                            } else {
                                if (typeof this.offsetIllus === 'undefined') {
                                    this.drawOffset(KfItem.minOffset, this.kfHeight, 0, true);
                                }
                                this.container.appendChild(this.offsetIllus);
                            }
                            if (preSibling.hasDuration) {
                                preSibling.showDuration();
                            } else {
                                if (typeof preSibling.durationIllus === 'undefined') {
                                    preSibling.drawDuration(KfItem.minDuration, this.kfWidth, this.kfHeight, false);
                                }
                                preSibling.container.appendChild(preSibling.durationIllus);
                            }
                            //target actions
                            if (!this.hasOffset && preSibling.hasDuration) {
                                updateSpec = true;//add default offset between kfs
                                actionType = action.UPDATE_DELAY_BETWEEN_KF;
                                actionInfo.aniId = this.parentObj.aniId;
                                actionInfo.delay = 300;
                            } else if (!preSibling.hasDuration && this.hasOffset) {
                                updateSpec = true;//change timing ref from with to after
                                actionType = action.UPDATE_KF_TIMING_REF;
                                actionInfo.aniId = this.parentObj.aniId;
                                actionInfo.ref = TimingSpec.timingRef.previousEnd;
                            } else {
                                updateSpec = false;
                                actionInfo = {};
                            }
                        } else if (posiDiff >= preKfDurationW && posiDiff < currentKfOffsetW + preKfDurationW) {//show pre duration
                            preSibling.cancelKfDragoverKf();
                            if (this.hasOffset) {
                                this.hideOffset();
                            } else {
                                if (typeof this.offsetIllus !== 'undefined' && this.container.contains(this.offsetIllus)) {
                                    this.container.removeChild(this.offsetIllus);
                                }
                            }
                            if (preSibling.hasDuration) {
                                preSibling.showDuration();
                            } else {
                                if (typeof preSibling.durationIllus === 'undefined') {
                                    preSibling.drawDuration(KfItem.minDuration, this.kfWidth, this.kfHeight, false);
                                }
                                preSibling.container.appendChild(preSibling.durationIllus);
                            }
                            //target actions
                            if (this.hasOffset && preSibling.hasDuration) {
                                updateSpec = true;//remove offset between kfs
                                actionType = action.UPDATE_DELAY_BETWEEN_KF;
                                actionInfo.aniId = this.parentObj.aniId;
                            } else if (this.hasOffset && !preSibling.hasDuration) {
                                updateSpec = true;//change timing ref from with to after and remove offset
                                actionType = action.UPDATE_TIMING_REF_DELAY_KF;
                                actionInfo.aniId = this.parentObj.aniId;
                                actionInfo.ref = TimingSpec.timingRef.previousEnd;
                                actionInfo.delay = 300;
                            } else {
                                updateSpec = false;
                                actionInfo = {};
                            }
                        } else if (posiDiff < preKfDurationW && posiDiff >= 0) {//show current offset
                            preSibling.cancelKfDragoverKf();
                            if (this.hasOffset) {
                                this.showOffset();
                            } else {
                                if (typeof this.offsetIllus === 'undefined') {
                                    this.drawOffset(KfItem.minOffset, this.kfHeight, 0, true);
                                }
                                this.container.appendChild(this.offsetIllus);
                            }
                            if (preSibling.hasDuration) {
                                preSibling.hideDuration();
                            } else {
                                if (typeof preSibling.durationIllus !== 'undefined' && preSibling.container.contains(preSibling.durationIllus)) {
                                    preSibling.container.removeChild(preSibling.durationIllus);
                                }
                            }
                            //target actions
                            if (!this.hasOffset && preSibling.hasDuration) {
                                updateSpec = true;//change timing ref from after to with, and add default offset
                                actionType = action.UPDATE_TIMING_REF_DELAY_KF;
                                actionInfo.aniId = this.parentObj.aniId;
                                actionInfo.ref = TimingSpec.timingRef.previousStart;
                                actionInfo.delay = 300;
                            } else if (this.hasOffset && preSibling.hasDuration) {
                                updateSpec = true; //change timing ref from after to with
                                actionType = action.UPDATE_KF_TIMING_REF;
                                actionInfo.aniId = this.parentObj.aniId;
                                actionInfo.ref = TimingSpec.timingRef.previousStart;
                            } else {
                                updateSpec = false;
                                actionInfo = {};
                            }
                        } else {//highlight pre kf
                            preSibling.kfDragoverKf();
                            if (this.hasOffset) {
                                this.hideOffset();
                            } else {
                                if (typeof this.offsetIllus !== 'undefined' && this.container.contains(this.offsetIllus)) {
                                    this.container.removeChild(this.offsetIllus);
                                }
                            }
                            if (preSibling.hasDuration) {
                                preSibling.hideDuration();
                            } else {
                                if (typeof preSibling.durationIllus !== 'undefined' && preSibling.container.contains(preSibling.durationIllus)) {
                                    preSibling.container.removeChild(preSibling.durationIllus);
                                }
                            }
                            //target actions
                            updateSpec = true;//remove lowest level grouping
                            actionType = action.REMOVE_LOWESTGROUP;
                            actionInfo.aniId = this.parentObj.aniId;
                        }
                    }

                    oriMousePosi = currentMousePosi;
                }
                document.onmouseup = () => {
                    document.onmousemove = null;
                    document.onmouseup = null;
                    Reducer.triger(action.UPDATE_MOUSE_MOVING, false);
                    if (!updateSpec) {
                        this.container.setAttributeNS(null, 'transform', this.container.getAttributeNS(null, '_transform'));
                        if (this.treeLevel === 1) {
                            this.parentObj.container.insertBefore(this.container, this.parentObj.groupMenu.container);
                        } else {
                            this.parentObj.container.appendChild(this.container);
                        }
                    } else {
                        Reducer.triger(actionType, actionInfo);
                        popKfContainer.removeChild(this.container);
                    }
                }
            }

        }
        if (this.hasOffset) {
            this.drawOffset(this.kfInfo.delay, this.kfHeight, 0);
            this.container.appendChild(this.offsetIllus);
            this.totalWidth += this.offsetWidth;
        }
        this.drawKfBg(this.treeLevel, size);
        this.container.appendChild(this.kfBg);
        console.log('rendering kf: ', this, this.hasDuration, this.hasHiddenDuration);
        if (this.hasDuration) {
            this.drawDuration(this.kfInfo.duration, this.kfWidth, this.kfHeight, false);
            this.container.appendChild(this.durationIllus);
            this.totalWidth += this.durationWidth;
        } else if (this.hasHiddenDuration) {
            console.log('draiwng hidden duration', this);
            this.drawDuration(this.kfInfo.duration, this.kfWidth, this.kfHeight, true);
            this.container.appendChild(this.durationIllus);
        }
        this.drawChart(this.kfInfo.allCurrentMarks, this.kfInfo.allGroupMarks, this.kfInfo.marksThisKf);
        this.container.appendChild(this.chartThumbnail);
        if (this.treeLevel === 1) {
            if (typeof this.parentObj.groupMenu === 'undefined') {//fake groups
                this.parentObj.container.appendChild(this.container);
            } else {
                this.parentObj.container.insertBefore(this.container, this.parentObj.groupMenu.container);
            }
        } else {
            this.parentObj.container.appendChild(this.container);
        }

        //if this kfItem is aligned to previous kfItems, update positions
        KfItem.allKfItems.set(this.id, this);
        if (typeof this.kfInfo.alignTo !== 'undefined') {
            this.updateAlignPosi(this.kfInfo.alignTo);
            // KfItem.allKfItems.set(this.id, this);
            //check whether there is already a line
            if (typeof IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo) !== 'undefined') {//already a line
                const refLineId: number = IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo).lineId;
                const oriToKf: number = IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo).theOtherEnd;
                const oriToKfBottom: number = KfItem.allKfItems.get(oriToKf).container.getBoundingClientRect().bottom;
                const currentKfBottom: number = this.container.getBoundingClientRect().bottom;
                if (currentKfBottom > oriToKfBottom) {//update the line info
                    IntelliRefLine.kfLineMapping.get(this.kfInfo.alignTo).theOtherEnd = this.id;
                    IntelliRefLine.kfLineMapping.delete(oriToKf);
                    IntelliRefLine.kfLineMapping.set(this.id, { theOtherEnd: this.kfInfo.alignTo, lineId: refLineId });
                    IntelliRefLine.updateLine(this.kfInfo.alignTo);
                }
            } else {// create a line
                let refLine: IntelliRefLine = new IntelliRefLine();
                refLine.createLine(this.kfInfo.alignTo, this.id);
                KfItem.allKfItems.get(this.kfInfo.alignTo).parentObj.alignLines.push(refLine.id);
                this.parentObj.alignLines.push(refLine.id);
            }
        } else {
            // KfItem.allKfItems.set(this.id, this);
        }
    }

    public showAlignFrame() {
        if (typeof this.alignFrame === 'undefined') {
            const itemBBox: DOMRect = this.container.getBoundingClientRect();
            this.alignFrame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this.alignFrame.setAttributeNS(null, 'width', `${itemBBox.width}`);
            this.alignFrame.setAttributeNS(null, 'height', `${itemBBox.height}`);
            this.alignFrame.setAttributeNS(null, 'stroke', KfItem.FRAME_COLOR);
            this.alignFrame.setAttributeNS(null, 'stroke-width', '1');
            this.alignFrame.setAttributeNS(null, 'stroke-dasharray', '4 2');
            this.alignFrame.setAttributeNS(null, 'fill', 'none');
            this.container.appendChild(this.alignFrame);
        } else {
            this.alignFrame.setAttributeNS(null, 'opacity', '1');
        }
    }

    public hideAlignFrame() {
        if (typeof this.alignFrame !== 'undefined') {
            this.alignFrame.setAttributeNS(null, 'opacity', '0');
        }
    }

    public hideDuration() {
        this.durationIllus.setAttributeNS(null, 'opacity', '0');
    }

    public showDuration() {
        this.durationIllus.setAttributeNS(null, 'opacity', '1');
    }

    public hideOffset() {
        this.offsetIllus.setAttributeNS(null, 'opacity', '0');
    }

    public showOffset() {
        this.offsetIllus.setAttributeNS(null, 'opacity', '1');
    }

    public kfDragoverKf() {
        this.kfBg.classList.add('dragover-kf');
    }

    public cancelKfDragoverKf() {
        this.kfBg.classList.remove('dragover-kf');
    }

    public updateAlignPosi(alignTo: number) {
        //use bbox to compare position
        const currentPosiX: number = this.container.getBoundingClientRect().left;
        const currentKfInfo: IKeyframe = KfItem.allKfInfo.get(this.id);
        const alignedKfInfo: IKeyframe = KfItem.allKfInfo.get(alignTo);
        const alignedKfItem: KfItem = KfItem.allKfItems.get(alignTo);
        console.log('in kf update align posi: ', this, alignedKfItem);
        if (alignedKfItem.rendered) {
            let alignedKfBgX: number = 0;
            if (currentKfInfo.timingRef === TimingSpec.timingRef.previousStart) {
                alignedKfBgX = alignedKfItem.kfBg.getBoundingClientRect().left;
            } else {
                console.log('updateing align position: ', alignedKfItem, KfItem.allKfInfo.get(alignedKfItem.id));
                alignedKfBgX = alignedKfItem.container.getBoundingClientRect().right;
                KfItem.allKfInfo.get(alignedKfItem.id).alignWithKfs.forEach((kfId: number) => {
                    console.log('fetching kf: ', kfId, this.id, KfItem.allKfItems);
                    if (kfId !== this.id) {
                        const tmpKf: KfItem = KfItem.allKfItems.get(kfId);
                        if (typeof tmpKf !== 'undefined' && tmpKf.rendered) {
                            const tmpKfBBox: DOMRect = tmpKf.container.getBoundingClientRect();
                            if (tmpKfBBox.right > alignedKfBgX) {
                                alignedKfBgX = tmpKfBBox.right;
                            }
                        }
                    }
                })
            }
            const bgDiffX: number = Math.abs(currentPosiX - alignedKfBgX);
            console.log('calculate bg diff: ', alignedKfBgX, currentPosiX, bgDiffX);
            if (currentPosiX > alignedKfBgX) { //translate aligned kf and its group
                console.log('translating alignwith kf');
                let posiXForNextKf: number = this.container.getBoundingClientRect().right;

                //update aligned kfs, together with those kfs after it, and those in its parent group
                const currentAlignedKfTransX: number = Tool.extractTransNums(alignedKfItem.container.getAttributeNS(null, 'transform')).x;
                alignedKfItem.container.setAttributeNS(null, 'transform', `translate(${currentAlignedKfTransX + bgDiffX}, ${KfItem.PADDING})`);
                const alignedKfItemBBox: DOMRect = alignedKfItem.container.getBoundingClientRect();
                if (alignedKfItemBBox.right > posiXForNextKf) {
                    posiXForNextKf = alignedKfItemBBox.right;
                }
                //update kfs and their groups aligned to alignedKfItem
                if (typeof alignedKfInfo.alignWithKfs !== 'undefined') {
                    alignedKfInfo.alignWithKfs.forEach((kfId: number) => {
                        const tmpKfItem = KfItem.allKfItems.get(kfId);
                        if (typeof tmpKfItem !== 'undefined') {
                            tmpKfItem.parentObj.translateGroup(tmpKfItem, bgDiffX, false, true, true);
                            const tmpKfItemBBox: DOMRect = tmpKfItem.container.getBoundingClientRect();
                            if (tmpKfItemBBox.right > posiXForNextKf) {
                                posiXForNextKf = tmpKfItemBBox.right;
                            }
                        }
                    })
                }
                //find the next kf in aligned group
                let flag: boolean = false;
                let transXForNextKf: number = 0;
                let nextKf: KfItem;
                for (let i: number = 0, len: number = alignedKfItem.parentObj.children.length; i < len; i++) {
                    const c: KfItem | KfOmit = alignedKfItem.parentObj.children[i];
                    if (flag) {
                        if (c instanceof KfOmit) {
                            transXForNextKf = bgDiffX;
                            const tmpTrans: ICoord = Tool.extractTransNums(c.container.getAttributeNS(null, 'transform'));
                            c.container.setAttributeNS(null, 'transform', `translate(${tmpTrans.x + transXForNextKf}, ${tmpTrans.y})`);
                            console.log('going to update transx: ');
                        } else {
                            if (c.container.getBoundingClientRect().left + transXForNextKf < posiXForNextKf) {
                                transXForNextKf = posiXForNextKf - c.container.getBoundingClientRect().left;
                            }
                            nextKf = c;
                            break;
                        }
                    }
                    if (c instanceof KfItem) {
                        flag = c.id === alignedKfItem.id
                    }
                }

                //update position of next kf in aligned group
                if (transXForNextKf > 0) {
                    console.log('translating nex kf: ', nextKf, transXForNextKf);
                    nextKf.parentObj.translateGroup(nextKf, transXForNextKf, true, true, true);
                }
            } else {//translate current kf
                console.log('translating current alignto kf');
                const currentTransX: number = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform')).x;
                this.container.setAttributeNS(null, 'transform', `translate(${currentTransX + bgDiffX}, ${KfItem.PADDING})`);
                console.log('updating translate: ', currentTransX, bgDiffX, currentTransX + bgDiffX);
                this.totalWidth += bgDiffX;

                //find the next kf in aligned group
                let reachTarget: boolean = false;
                let transXForNextKf: number = 0;
                let nextKf: KfItem;
                for (let i: number = 0, len: number = alignedKfItem.parentObj.children.length; i < len; i++) {
                    const c: KfItem | KfOmit = alignedKfItem.parentObj.children[i];
                    if (reachTarget) {
                        if (c instanceof KfOmit) {
                            // transXForNextKf += KfOmit.OMIT_W + KfGroup.PADDING;
                        } else {
                            if (c.container.getBoundingClientRect().left < this.container.getBoundingClientRect().right) {
                                transXForNextKf = this.container.getBoundingClientRect().right - c.container.getBoundingClientRect().left;
                            }
                            nextKf = c;
                            break;
                        }
                    }
                    if (c instanceof KfItem) {
                        reachTarget = c.id === alignedKfItem.id
                    }
                }

                //update position of next kf in aligned group
                if (transXForNextKf > 0) {
                    alignedKfItem.parentObj.translateGroup(nextKf, transXForNextKf, true, true, true);
                }
            }
            //update the refline
            IntelliRefLine.updateLine(alignTo);
        }
    }

    public drawKfBg(treeLevel: number, size?: ISize): void {
        console.log("size is: ", size);
        if (typeof size !== 'undefined') {
            this.kfWidth = size.w;
        } else {
            this.kfWidth = KfItem.KF_WIDTH - treeLevel * KfItem.KF_W_STEP;
        }
        this.kfBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.kfBg.setAttributeNS(null, 'fill', '#fff');
        this.kfBg.setAttributeNS(null, 'x', `${typeof this.offsetIllus === 'undefined' ? 0 : this.offsetWidth}`);
        this.kfBg.setAttributeNS(null, 'y', '0');
        this.kfBg.setAttributeNS(null, 'width', `${this.kfWidth}`);
        this.kfBg.setAttributeNS(null, 'height', `${this.kfHeight}`);
        this.totalWidth += this.kfWidth;
    }

    public drawStaticChart(staticMarks: string[]) {
        const svg: HTMLElement = document.getElementById('visChart');
        Array.from(svg.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
            if (!staticMarks.includes(m.id)) {
                m.setAttributeNS(null, '_opacity', m.getAttributeNS(null, 'opacity') ? m.getAttributeNS(null, 'opacity') : '1');
                m.setAttributeNS(null, 'opacity', '0');
                m.classList.add('translucent-mark');
            }
        })
        this.renderChartToCanvas(svg);
        Array.from(svg.getElementsByClassName('translucent-mark')).forEach((m: HTMLElement) => {
            m.classList.remove('translucent-mark');
            m.setAttributeNS(null, 'opacity', m.getAttributeNS(null, '_opacity'));
        })
    }

    public drawChart(allMarks: string[], allGroupMarks: string[], marksThisKf: string[]): void {
        const svg: HTMLElement = document.getElementById('visChart');
        Array.from(svg.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
            if (!allMarks.includes(m.id) && !marksThisKf.includes(m.id)) {
                m.setAttributeNS(null, '_opacity', m.getAttributeNS(null, 'opacity') ? m.getAttributeNS(null, 'opacity') : '1');
                m.setAttributeNS(null, 'opacity', '0');
                m.classList.add('translucent-mark');
            } else if (allMarks.includes(m.id) && !marksThisKf.includes(m.id) && !allGroupMarks.includes(m.id)) {
                m.setAttributeNS(null, '_opacity', m.getAttributeNS(null, 'opacity') ? m.getAttributeNS(null, 'opacity') : '1');
                m.setAttributeNS(null, 'opacity', '0.4');
                m.classList.add('translucent-mark');
            }
        })
        this.renderChartToCanvas(svg);
        Array.from(svg.getElementsByClassName('translucent-mark')).forEach((m: HTMLElement) => {
            m.classList.remove('translucent-mark');
            m.setAttributeNS(null, 'opacity', m.getAttributeNS(null, '_opacity'));
        })
    }

    public renderChartToCanvas(svg: HTMLElement): void {
        const imgSrc: string = Tool.svg2url(svg);
        this.chartThumbnail = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.chartThumbnail.setAttributeNS(null, 'x', `${typeof this.offsetIllus === 'undefined' ? 0 : this.offsetWidth}`);
        this.chartThumbnail.setAttributeNS(null, 'y', '0');
        this.chartThumbnail.setAttributeNS(null, 'width', `${this.kfWidth}`);
        this.chartThumbnail.setAttributeNS(null, 'height', `${this.kfHeight}`);
        this.chartThumbnail.setAttributeNS(null, 'href', imgSrc);
    }

    public highlightKf() {
        this.isHighlighted = true;
        this.kfBg.setAttributeNS(null, 'class', 'highlight-kf');
    }

    public cancelHighlightKf() {
        this.isHighlighted = false;
        this.kfBg.classList.remove('highlight-kf');
    }

    public transNextKf(transX: number) {
        let nextKf: KfItem | KfOmit;
        for (let i = 0, len = this.parentObj.children.length; i < len; i++) {
            if (this.parentObj.children[i].id === this.id) {
                nextKf = this.parentObj.children[i + 1];
                break;
            }
        }
        // this.parentObj.translateGroup(nextKf, transX, true);
        const oriTrans: ICoord = Tool.extractTransNums(nextKf.container.getAttributeNS(null, 'transform'));
        nextKf.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x + transX}, ${oriTrans.y})`);
        this.parentObj.updateSize();
    }

    public startAdjustingTime() {
        this.parentObj.transHideTitle();
    }

    public dragSelOver() {
        Tool.clearDragOver();
        this.kfBg.setAttributeNS(null, 'class', 'dragover-kf');
        KfItem.dragoverKf = this;
    }

    public dragSelOut() {
        this.kfBg.classList.remove('dragover-kf');
        KfItem.dragoverKf = undefined;
    }

    public dropSelOn() {
        let currentSelection: string[] = state.selection;
        Reducer.triger(action.UPDATE_SELECTION, []);
        if (this.id === KfItem.STATIC_KF_ID) {
            //update static marks
            Reducer.triger(action.UPDATE_STATIC_SELECTOR, currentSelection);
        } else {

        }
    }

    /**
     * translate kfs and groups aligned to this kf
     * @param transX 
     * @param updateAlignedKfs: might further influence other aligned elements 
     */
    public translateAlignedGroups(transX: number, updateAlignedKfs: boolean) {
        if (typeof KfItem.allKfInfo.get(this.id).alignWithKfs !== 'undefined') {
            IntelliRefLine.updateLine(this.id);//k is a alignwith kf, update refline
            KfItem.allKfInfo.get(this.id).alignWithKfs.forEach((kfId: number) => {
                const tmpKfItem = KfItem.allKfItems.get(kfId);
                if (typeof tmpKfItem !== 'undefined') {
                    // tmpKfItem.parentObj.translateGroup(tmpKfItem, transX, updateAlignedKfs, true, true);
                    const tmpTrans: ICoord = Tool.extractTransNums(tmpKfItem.container.getAttributeNS(null, 'transform'));
                    tmpKfItem.container.setAttributeNS(null, 'transform', `translate(${tmpTrans.x + transX}, ${tmpTrans.y})`);
                    let [diffX, currentGroupWidth, childHeight] = tmpKfItem.parentObj.updateSize();
                    const oriTrans: ICoord = Tool.extractTransNums(tmpKfItem.parentObj.container.getAttributeNS(null, 'transform'));
                    tmpKfItem.parentObj.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x + diffX}, ${oriTrans.y})`);
                    //check whether need to update omit
                    tmpKfItem.parentObj.kfOmits.forEach((kfo: KfOmit) => {
                        const omitTrans: ICoord = Tool.extractTransNums(kfo.container.getAttributeNS(null, 'transform'));
                        if (omitTrans.x >= tmpTrans.x) {
                            let omitTransX: number = diffX === 0 ? transX : 0;
                            kfo.container.setAttributeNS(null, 'transform', `translate(${omitTrans.x + omitTransX}, ${omitTrans.y})`)
                        }
                    })
                }
            })
        }
    }
}
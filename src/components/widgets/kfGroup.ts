import KfTrack from "./kfTrack";
import { IKeyframeGroup } from "../../app/ds";
import KfOmit from "./kfOmit";
import KfTimingIllus from "./kfTimingIllus";
import KfItem from "./kfItem";
import Tool from "../../util/tool";
import { ICoord } from "../../util/ds";
import IntelliRefLine from "./intelliRefLine";

import '../../assets/style/keyframeGroup.scss'
import { KfContainer } from "../kfContainer";
import * as action from "../../app/action";
import Reducer from "../../app/reducer";
import { TimingSpec, Animation } from 'canis_toolkit';
import PlusBtn from "./plusBtn";
import { hintTag } from "./hint";

export default class KfGroup extends KfTimingIllus {
    static groupIdx: number = 0;
    static leafLevel: number = 0;
    static BASIC_GRAY: number = 239;
    static GRAY_STEP: number = 20;
    static PADDING: number = 6;
    static GROUP_RX: number = 8;
    static TITLE_CHAR_WIDTH: number = 9;
    static TITLE_PADDING: number = 4;
    static TITLE_HEIHGT: number = 18;
    static allActions: Map<string, any> = new Map();//key: aniId, value: action

    // public id: number;
    // public aniId: string;
    public newTrack: boolean;
    public posiX: number;
    public posiY: number;
    public delay: number;
    public title: string;
    public fullTitle: string;
    public rendered: boolean = false;
    public idxInGroup: number = 0;
    public groupRef: string = '';
    public timingRef: string = TimingSpec.timingRef.previousStart;
    public kfHasOffset: boolean = false;//for updating omits
    public kfHasDuration: boolean = false;//for updating omits
    public width: number = 0;
    public marks: string[];
    public treeLevel: number;
    // public container: SVGGElement;
    public isDragging: boolean = false;
    public groupBg: SVGRectElement;
    public groupMenu: GroupMenu;
    public groupMenuMask: SVGMaskElement;
    public groupTitle: SVGGElement;
    public children: any[] = [];
    public kfNum: number = 0;
    public kfOmits: KfOmit[] = [];
    public parentObj: KfGroup | KfTrack;
    public alignLines: number[] = [];

    set offsetDiff(od: number) {//for dragging the offset stretch bar
        this._offsetDiff = od;
        // this.hideLinesInGroup();
        this.transKfDragOffset();
        this.translateWholeGroup(od);
    }
    get offsetDiff(): number {
        return this._offsetDiff;
    }

    public static reset() {
        this.groupIdx = 0;
        this.leafLevel = 0;
    }

    public addEasingTransform() {
        this.groupTitle.classList.add('ease-transform');
    }
    public removeEasingTransform() {
        this.groupTitle.classList.remove('ease-transform');
    }

    /**
     * @param g : container of this group, could be track or another group
     * @param p : init position of the root group
     */
    public createGroup(kfg: IKeyframeGroup, parentObj: KfGroup | KfTrack, posiY: number, treeLevel: number): void {
        console.log('create group: ', kfg, treeLevel);
        this.id = kfg.id;
        this.aniId = kfg.aniId;
        this.marks = kfg.marks;
        this.groupRef = kfg.groupRef;
        this.timingRef = kfg.timingRef;
        this.newTrack = kfg.newTrack;
        this.treeLevel = treeLevel;
        this.posiY = posiY;
        this.hasOffset = kfg.delayIcon;
        this.parentObj = parentObj;
        this.delay = kfg.delay;
        if (typeof kfg.refValue === 'undefined') {
            let classRecorder: Set<string> = new Set();
            this.marks.forEach((m: string) => {
                classRecorder.add(Animation.markClass.get(m));
            })
            let tmpTitle: string = [...classRecorder].join(', ');
            this.fullTitle = tmpTitle;
            if (tmpTitle.length > 23) {
                tmpTitle = tmpTitle.substring(0, 23) + '...';
            }
            this.title = tmpTitle;
        } else {
            this.fullTitle = kfg.refValue;
            this.title = kfg.refValue;
        }

        if (typeof parentObj.container !== 'undefined') {
            this.rendered = true;
            this.renderGroup();
        }
    }

    public renderGroup() {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'id', `group${this.id}`);
        // this.container.classList.add('ease-transform');
        if (this.parentObj instanceof KfTrack) {
            this.posiY = 1;
            const transX: number = this.parentObj.availableInsert;
            this.container.setAttributeNS(null, 'transform', `translate(${transX}, ${this.posiY})`);
            this.parentObj.children.push(this);
            this.idxInGroup = this.parentObj.children.length - 1;
        }
        if (this.hasOffset) {
            this.drawOffset(this.delay, 100, KfGroup.GROUP_RX);
            this.container.appendChild(this.offsetIllus);
        }
        this.drawGroupBg();
        this.container.appendChild(this.groupTitle);
        this.container.appendChild(this.groupBg);

        if (this.treeLevel === 1 && this.parentObj instanceof KfGroup) {
            this.parentObj.container.insertBefore(this.container, this.parentObj.groupMenu.container);
        } else {
            if (this.treeLevel === 0) {
                this.drawGroupMenu();
                this.container.appendChild(this.groupMenu.container);
                this.container.onmouseover = () => {
                    this.groupMenu.showMenu();
                }
            }
            this.parentObj.container.appendChild(this.container);
        }

        this.container.onmouseout = (outEvt) => {
            if (!this.isDragging) {
                //this is the original element the event handler was assigned to
                var e = outEvt.relatedTarget;

                while (e != null) {
                    if (e == this.container) {
                        return;
                    }
                    e = (<HTMLElement>e).parentNode;
                }
                this.hideTitle();
                if (this.treeLevel === 0) {
                    this.groupMenu.hideMenu();
                }
                // this.container.onmouseout = null;
            }
        }
    }

    public drawGroupMenu(): void {
        console.log(KfGroup.allActions, this.aniId, this.id);
        this.groupMenu = new GroupMenu(KfGroup.allActions.get(this.aniId), this.id);
        this.groupMenu.createAndRenderMenu();
    }

    public updateParentKfHasTiming(hasOffset: boolean, hasDuration: boolean): void {
        this.kfHasOffset = hasOffset;
        this.kfHasDuration = hasDuration;
        if (this.parentObj instanceof KfGroup) {
            if (this.parentObj.kfHasOffset !== hasOffset || this.parentObj.kfHasDuration !== hasDuration) {
                this.parentObj.updateParentKfHasTiming(hasOffset, hasDuration);
            }
        }
    }

    public showTitle(): void {
        const oriTransX: number = Tool.extractTransNums(this.groupTitle.getAttributeNS(null, 'transform')).x;
        if (this.parentObj instanceof KfGroup) {
            this.parentObj.hideTitle();
        }
        this.groupTitle.setAttributeNS(null, 'transform', `translate(${oriTransX}, ${-KfGroup.TITLE_HEIHGT})`);
    }

    public hideTitle(): void {
        const oriTransX: number = Tool.extractTransNums(this.groupTitle.getAttributeNS(null, 'transform')).x;
        this.groupTitle.setAttributeNS(null, 'transform', `translate(${oriTransX}, 0)`);
    }

    public bindTitleHover(): void {
        this.groupTitle.onmouseover = (overEvt) => {
            hintTag.createHint({ x: overEvt.pageX, y: overEvt.pageY }, `Marks this group: ${this.fullTitle}`);
        }
        this.groupTitle.onmouseout = () => {
            hintTag.removeHint();
        }
    }

    public unbindTitleHover() {
        this.groupTitle.onmouseover = null;
        this.groupTitle.onmouseout = null;
    }

    /**
     * draw group bg as well as title
     */
    public drawGroupBg(): void {
        this.groupTitle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.groupTitle.classList.add('ease-transform');
        this.groupTitle.classList.add('draggable-component');
        this.groupTitle.setAttributeNS(null, 'transform', `translate(${this.offsetWidth}, 0)`);
        const groupTitleBg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        groupTitleBg.setAttributeNS(null, 'x', '0');
        groupTitleBg.setAttributeNS(null, 'y', '0');
        groupTitleBg.setAttributeNS(null, 'width', `${KfGroup.TITLE_CHAR_WIDTH * this.title.length + 2 * KfGroup.TITLE_PADDING}`);
        groupTitleBg.setAttributeNS(null, 'height', '30');
        groupTitleBg.setAttributeNS(null, 'fill', '#676767');
        groupTitleBg.setAttributeNS(null, 'rx', `${KfGroup.GROUP_RX}`);
        this.groupTitle.appendChild(groupTitleBg);
        const groupTitleContent: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        groupTitleContent.innerHTML = this.title;
        groupTitleContent.setAttributeNS(null, 'x', '6');
        groupTitleContent.setAttributeNS(null, 'y', `${KfGroup.TITLE_HEIHGT - 4}`);
        groupTitleContent.setAttributeNS(null, 'fill', '#fff');
        groupTitleContent.classList.add('monospace-font');
        groupTitleContent.setAttributeNS(null, 'font-size', '10pt');
        this.groupTitle.appendChild(groupTitleContent);

        this.bindTitleHover();

        this.groupTitle.onmousedown = (downEvt) => {
            this.isDragging = true;
            hintTag.removeHint();
            this.unbindTitleHover();
            let oriMousePosi: ICoord = { x: downEvt.pageX, y: downEvt.pageY };
            this.container.setAttributeNS(null, '_transform', this.container.getAttributeNS(null, 'transform'));
            const containerBBox: DOMRect = this.container.getBoundingClientRect();
            this.parentObj.container.removeChild(this.container);
            const popKfContainer: HTMLElement = document.getElementById(KfContainer.KF_POPUP);
            const popKfContainerBbox: DOMRect = popKfContainer.getBoundingClientRect();
            popKfContainer.appendChild(this.container);
            //set new transform
            this.container.setAttributeNS(null, 'transform', `translate(${containerBBox.left - popKfContainerBbox.left}, ${containerBBox.top - popKfContainerBbox.top + KfGroup.TITLE_HEIHGT})`);

            let updateSpec: boolean = false;
            let actionType: string = '';
            let actionInfo: any = {};
            document.onmousemove = (moveEvt) => {
                const currentMousePosi: ICoord = { x: moveEvt.pageX, y: moveEvt.pageY };
                const posiDiff: ICoord = { x: currentMousePosi.x - oriMousePosi.x, y: currentMousePosi.y - oriMousePosi.y };
                const oriTrans: ICoord = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform'));
                this.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x + posiDiff.x}, ${oriTrans.y + posiDiff.y})`);
                const preSibling: KfGroup = this.parentObj.children[this.idxInGroup - 1];
                if (this.idxInGroup > 0 && preSibling.rendered && this.groupRef !== 'root') {//group within animation
                    const currentGroupBBox: DOMRect = this.groupBg.getBoundingClientRect();
                    const preGroupBBox: DOMRect = preSibling.groupBg.getBoundingClientRect();
                    const posiYDiff: number = currentGroupBBox.top - preGroupBBox.top;
                    const posiXRightDiff: number = currentGroupBBox.left - preGroupBBox.right;
                    const posiXLeftDiff: number = currentGroupBBox.left - preGroupBBox.left;
                    const currentKfOffsetW: number = KfGroup.BASIC_OFFSET_DURATION_W > this.offsetWidth ? KfGroup.BASIC_OFFSET_DURATION_W : this.offsetWidth;
                    let correctTimingRef: boolean = true;
                    let compareXDiff: number = posiXRightDiff;
                    let updateTimingRef: string = '';
                    if (posiYDiff <= this.groupBg.getBoundingClientRect().height) {//timing ref should be start after
                        if (this.timingRef !== TimingSpec.timingRef.previousEnd) {
                            correctTimingRef = false;
                            updateTimingRef = TimingSpec.timingRef.previousEnd;
                        }
                    } else {//create new track and change timing ref to start with
                        if (this.timingRef !== TimingSpec.timingRef.previousStart) {
                            correctTimingRef = false;
                            updateTimingRef = TimingSpec.timingRef.previousStart;
                        }
                        compareXDiff = posiXLeftDiff;
                    }
                    if (compareXDiff >= currentKfOffsetW) {//show delay
                        preSibling.cancelHighlightGroup();
                        if (!this.hasOffset) {//add default delay
                            if (typeof this.offsetIllus === 'undefined') {
                                this.drawOffset(KfGroup.minOffset, this.groupBg.getBoundingClientRect().height, KfGroup.GROUP_RX, true);
                            }
                            this.container.prepend(this.offsetIllus);

                            updateSpec = true;
                            actionInfo.aniId = this.aniId;
                            actionInfo.groupRef = this.groupRef;
                            actionInfo.delay = 300;
                            if (correctTimingRef) {
                                actionType = action.UPDATE_DELAY_BETWEEN_GROUP;
                            } else {
                                actionType = action.UPDATE_DELAY_TIMING_REF_BETWEEN_GROUP;
                                actionInfo.ref = updateTimingRef;
                            }
                        } else {
                            this.showOffset();
                            if (correctTimingRef) {
                                updateSpec = false
                                actionInfo = {};
                            } else {
                                updateSpec = true;
                                actionType = action.UPDATE_TIMEING_REF_BETWEEN_GROUP;
                                actionInfo.aniId = this.aniId;
                                actionInfo.groupRef = this.groupRef;
                                actionInfo.ref = updateTimingRef;
                            }
                        }
                    } else if (compareXDiff < currentKfOffsetW && compareXDiff >= 0) {//remove delay
                        preSibling.cancelHighlightGroup();
                        if (this.hasOffset) {//remove delay
                            this.hideOffset();

                            updateSpec = true;
                            actionInfo.aniId = this.aniId;
                            actionInfo.groupRef = this.groupRef;
                            if (correctTimingRef) {
                                actionType = action.REMOVE_DELAY_BETWEEN_GROUP;
                            } else {
                                actionType = action.REMOVE_DELAY_UPDATE_TIMING_REF_GROUP;
                                actionInfo.ref = updateTimingRef;
                            }
                        } else {
                            if (typeof this.offsetIllus !== 'undefined' && this.container.contains(this.offsetIllus)) {
                                this.container.removeChild(this.offsetIllus);
                            }
                            if (correctTimingRef) {
                                updateSpec = false
                                actionInfo = {};
                            } else {
                                updateSpec = true;
                                actionType = action.UPDATE_TIMEING_REF_BETWEEN_GROUP;
                                actionInfo.aniId = this.aniId;
                                actionInfo.groupRef = this.groupRef;
                                actionInfo.ref = updateTimingRef;
                            }
                        }
                    } else {//
                        if (posiYDiff <= this.groupBg.getBoundingClientRect().height) {//timing ref should be start after
                            preSibling.highlightGroup();
                            updateSpec = true;
                            actionType = action.MERGE_GROUP;
                            actionInfo.aniId = this.aniId;
                            actionInfo.groupRef = this.groupRef;
                        } else {//create new track and change timing ref to start with
                            preSibling.cancelHighlightGroup();
                            if (this.hasOffset) {//remove delay
                                this.hideOffset();

                                updateSpec = true;
                                actionInfo.aniId = this.aniId;
                                actionInfo.groupRef = this.groupRef;
                                if (correctTimingRef) {
                                    actionType = action.REMOVE_DELAY_BETWEEN_GROUP;
                                } else {
                                    actionType = action.REMOVE_DELAY_UPDATE_TIMING_REF_GROUP;
                                    actionInfo.ref = updateTimingRef;
                                }
                            } else {
                                if (typeof this.offsetIllus !== 'undefined' && this.container.contains(this.offsetIllus)) {
                                    this.container.removeChild(this.offsetIllus);
                                }
                                if (correctTimingRef) {
                                    updateSpec = false
                                    actionInfo = {};
                                } else {
                                    updateSpec = true;
                                    actionType = action.UPDATE_TIMEING_REF_BETWEEN_GROUP;
                                    actionInfo.aniId = this.aniId;
                                    actionInfo.groupRef = this.groupRef;
                                    actionInfo.ref = updateTimingRef;
                                }
                            }
                        }

                    }
                }
                oriMousePosi = currentMousePosi;
            }

            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                this.bindTitleHover();
                this.isDragging = false;
                if (!updateSpec) {
                    this.container.setAttributeNS(null, 'transform', this.container.getAttributeNS(null, '_transform'));
                    if (this.treeLevel === 1 && this.parentObj instanceof KfGroup) {
                        this.parentObj.container.insertBefore(this.container, this.parentObj.groupMenu.container);
                    } else {
                        this.parentObj.container.appendChild(this.container);
                    }
                } else {
                    //triger action
                    Reducer.triger(actionType, actionInfo);
                    popKfContainer.removeChild(this.container);
                }
            }
        }

        this.groupBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.groupBg.setAttributeNS(null, 'stroke', '#898989');
        this.groupBg.setAttributeNS(null, 'stroke-width', '1');
        this.groupBg.setAttributeNS(null, 'rx', `${KfGroup.GROUP_RX}`);
        this.groupBg.setAttributeNS(null, 'x', `${this.offsetWidth}`);
        this.groupBg.onmouseover = () => {
            this.showTitle();
        }
    }

    public hideOffset() {
        this.offsetIllus.setAttributeNS(null, 'opacity', '0');
    }

    public showOffset() {
        this.offsetIllus.setAttributeNS(null, 'opacity', '1');
    }

    public highlightGroup() {
        this.groupBg.classList.add('highlight-kf');
    }

    public cancelHighlightGroup() {
        this.groupBg.classList.remove('highlight-kf');
    }

    /**
     * when this group translates, translate the aligned elements: refLine, kfs and their group
     * @param transX 
     */
    public translateWholeGroup(transX: number) {
        //find all group ids in current group
        let allGroupIds: number[] = [];
        this.findAllGroups(allGroupIds);

        //according to reflines in this group, find all related kfs, then find their groups, then translate those groups
        const allAlignedKfs: Set<number> = new Set();
        this.alignLines.forEach((lId: number) => {
            const refLine: IntelliRefLine = IntelliRefLine.allLines.get(lId);
            //translate the line
            Tool.updateTranslate(refLine.line, { x: transX, y: 0 });
            IntelliRefLine.kfLineMapping.forEach((value: { theOtherEnd: number, lineId: number }, kfId: number) => {
                if (value.lineId === lId) {
                    allAlignedKfs.add(kfId);
                    allAlignedKfs.add(value.theOtherEnd);
                }
            })
        })

        //find their kfgroups
        let targetTransGroupIds: number[] = [];
        [...allAlignedKfs].forEach((kfId: number) => {
            const tmpGroup: KfGroup = KfItem.allKfItems.get(kfId).parentObj;
            const tmpGroupId: number = tmpGroup.id;
            if (!allGroupIds.includes(tmpGroupId) && !targetTransGroupIds.includes(tmpGroupId)) {
                targetTransGroupIds.push(tmpGroupId);
                // targetTransGroups.push(tmpGroup);
                Tool.updateTranslate(tmpGroup.container, { x: transX, y: 0 });
            }
        })
    }

    public findAllGroups(idArr: number[]): void {
        idArr.push(this.id);
        this.children.forEach((c: any) => {
            if (c instanceof KfGroup) {
                c.findAllGroups(idArr);
            }
        })
    }


    /**
     * translate from a given kf in group, update size of this group, and size and position of siblings and parents
     * @param startTransItem 
     * @param transX 
     * @param updateAlignedKfs 
     */
    public translateGroup(startTransItem: KfItem | PlusBtn, transX: number, updateAlignedKfs: boolean = false): void {
        //translate kfitems after the input one within the same group
        const currentTransX: number = Tool.extractTransNums(startTransItem.container.getAttributeNS(null, 'transform')).x;
        let count: number = 0;
        this.children.forEach((k: KfItem | KfOmit) => {
            const tmpTrans: ICoord = Tool.extractTransNums(k.container.getAttributeNS(null, 'transform'));
            if (tmpTrans.x >= currentTransX && !(count === 0 && k instanceof KfOmit) && !(count === 0 && k instanceof PlusBtn)) {//translate this kf or omit
                k.container.setAttributeNS(null, 'transform', `translate(${tmpTrans.x + transX}, ${tmpTrans.y})`);
                if (k instanceof KfItem) {
                    if (updateAlignedKfs && typeof KfItem.allKfInfo.get(k.id).alignWithKfs !== 'undefined') {
                        IntelliRefLine.updateLine(k.id);//k is a alignwith kf, update refline
                        KfItem.allKfInfo.get(k.id).alignWithKfs.forEach((kfId: number) => {
                            const tmpKfItem = KfItem.allKfItems.get(kfId);
                            if (typeof tmpKfItem !== 'undefined') {
                                tmpKfItem.parentObj.translateGroup(tmpKfItem, transX);
                            }
                        })
                    }
                }
                count++;
            }
        })
        //update the group size and position
        this.updateSize();

        //update parent group and siblings
        this.updateSiblingAndParentSizePosi(transX, updateAlignedKfs);
    }

    public updateSiblingAndParentSizePosi(transX: number, updateAlignedKfs: boolean) {
        //translate siblings
        let flag: boolean = false;
        this.parentObj.children.forEach((c: KfGroup | KfOmit) => {
            if (flag) {
                if (c instanceof KfOmit || (c instanceof KfGroup && c.rendered)) {
                    const tmpTrans: ICoord = Tool.extractTransNums(c.container.getAttributeNS(null, 'transform'));
                    c.container.setAttributeNS(null, 'transform', `translate(${tmpTrans.x + transX}, ${tmpTrans.y})`);
                    if (c instanceof KfGroup) {
                        if (c.children[0] instanceof KfItem && updateAlignedKfs) {//need to update the aligned kfs and their group
                            c.children.forEach((cc: KfItem | KfOmit) => {
                                if (cc instanceof KfItem) {
                                    const tmpAlignTargetLeft: number = cc.kfBg.getBoundingClientRect().left;
                                    if (typeof KfItem.allKfInfo.get(cc.id).alignWithKfs !== 'undefined') {
                                        IntelliRefLine.updateLine(cc.id);//cc is a alignwith kf, update refline
                                        KfItem.allKfInfo.get(cc.id).alignWithKfs.forEach((kfId: number) => {
                                            const tmpKfItem: KfItem = KfItem.allKfItems.get(kfId);
                                            if (typeof tmpKfItem !== 'undefined') {
                                                if (tmpKfItem.container.getBoundingClientRect().left !== tmpAlignTargetLeft) {//this kf together with its group need to be updated
                                                    tmpKfItem.parentObj.translateGroup(tmpKfItem, tmpAlignTargetLeft - tmpKfItem.container.getBoundingClientRect().left);
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            }
            if (c instanceof KfGroup) {
                flag = c.id === this.id
            }
        })
        //update size and position of parent
        if (this.parentObj instanceof KfGroup) {
            this.parentObj.updateSize();
            this.parentObj.updateSiblingAndParentSizePosi(transX, updateAlignedKfs);
        }
    }

    public updateSize(): [number, number, number] {
        //get size of all children (kfgroup or kfitem)
        let maxBoundry: {
            top: number
            right: number
            bottom: number
            left: number
        } = { top: 100000, right: 0, bottom: 0, left: 100000 }
        //the first child within group should have the translate as KfGroup.PADDING
        let diffX: number = 0;
        if (this.children[0] instanceof KfItem) {
            const currentTransX: number = Tool.extractTransNums(this.children[0].container.getAttributeNS(null, 'transform')).x;
            diffX = this.hasOffset ? currentTransX - KfGroup.PADDING - this.offsetWidth : currentTransX - KfGroup.PADDING;
        }
        this.children.forEach((c: KfGroup | KfItem | KfOmit) => {
            if (typeof c.container !== 'undefined') {
                if (c instanceof KfItem || c instanceof KfOmit) {
                    const currentTrans: ICoord = Tool.extractTransNums(c.container.getAttributeNS(null, 'transform'));
                    c.container.setAttributeNS(null, 'transform', `translate(${currentTrans.x - diffX}, ${currentTrans.y})`);
                }
                const tmpBBox: DOMRect = c.container.getBoundingClientRect();
                if (tmpBBox.top < maxBoundry.top) {
                    maxBoundry.top = tmpBBox.top;
                }
                if (tmpBBox.right > maxBoundry.right) {
                    maxBoundry.right = tmpBBox.right;
                }
                if (tmpBBox.bottom > maxBoundry.bottom) {
                    maxBoundry.bottom = tmpBBox.bottom;
                }
                if (tmpBBox.left < maxBoundry.left) {
                    maxBoundry.left = tmpBBox.left;
                }
            }
        })
        let currentGroupWidth: number = maxBoundry.right - maxBoundry.left + 2 * KfGroup.PADDING;
        let childHeight: number = maxBoundry.bottom - maxBoundry.top + 2 * KfGroup.PADDING;

        //TODO consider size of suggestion frame

        //update size
        this.groupBg.setAttributeNS(null, 'height', `${childHeight}`);
        this.groupBg.setAttributeNS(null, 'width', `${currentGroupWidth}`);
        if (this.hasOffset) {
            this.updateOffset(childHeight);
            currentGroupWidth += this.offsetWidth;
        }
        return [diffX, currentGroupWidth, childHeight];
    }

    public updateGroupPosiAndSize(lastGroupStart: number, lastGroupWidth: number, lastGroup: boolean, rootGroup: boolean = false): void {
        if (this.children) {
            if (this.children[0] instanceof KfGroup) {//children are kfgroups
                this.children.forEach((c: KfGroup, i: number) => {
                    if (i === 0 || i === 1 || i === this.children.length - 1) {
                        if (i === 0) {
                            this.children[i].updateGroupPosiAndSize(KfGroup.PADDING + this.offsetWidth, 0, false);
                        } else {
                            if (this.children.length > 3 && i === this.children.length - 1) {
                                this.children[i].updateGroupPosiAndSize(this.children[1].posiX, this.children[1].width + KfOmit.OMIT_W, true);
                            } else {
                                this.children[i].updateGroupPosiAndSize(this.children[i - 1].posiX, this.children[i - 1].width, false);
                            }
                        }
                    } else if (this.children.length > 3 && i === this.children.length - 2) {
                        this.kfOmits.forEach((kfO: KfOmit) => {
                            kfO.updateThumbnail(this.kfHasOffset, this.kfHasDuration);
                            kfO.updateNum(this.kfNum - 3);
                            kfO.updateTrans(this.children[1].posiX + this.children[1].width, KfGroup.PADDING + this.children[1].container.getBoundingClientRect().height / 2);
                        })
                    }
                    this.alignLines = [...this.alignLines, ...c.alignLines];
                })

            }

            //update size
            const oriW: number = this.width;
            let [diffX, currentGroupWidth, gHeight] = this.updateSize();
            if (this.parentObj instanceof KfTrack) {
                KfTrack.aniTrackMapping.get(this.aniId).forEach((kft: KfTrack) => {
                    kft.availableInsert += (currentGroupWidth - oriW);
                })
            }

            //update position of menu if there is one
            if (typeof this.groupMenu !== 'undefined') {
                this.groupMenu.updatePosition(this.offsetWidth, gHeight);
            }

            //update background color
            const grayColor: number = KfGroup.BASIC_GRAY - KfGroup.GRAY_STEP * (KfGroup.leafLevel - this.treeLevel);
            this.groupBg.setAttributeNS(null, 'fill', `rgba(${grayColor}, ${grayColor}, ${grayColor}, 1)`);

            //update position
            const transPosiY = rootGroup ? this.posiY + 1 : this.posiY + KfGroup.PADDING;
            if (this.newTrack) {
                this.container.setAttributeNS(null, 'transform', `translate(${lastGroupStart + diffX}, ${transPosiY})`);
                this.posiX = lastGroupStart + this.offsetWidth;
                this.width = currentGroupWidth > lastGroupWidth ? currentGroupWidth : lastGroupWidth;
            } else {
                this.container.setAttributeNS(null, 'transform', `translate(${lastGroupStart + lastGroupWidth + diffX}, ${transPosiY})`);
                this.posiX = lastGroupStart + lastGroupWidth;
                this.width = currentGroupWidth;
            }
        }
    }

}

export class GroupMenu {
    static BTN_SIZE: number = 16;
    static PADDING: number = 4;
    static PADDING_LEFT: number = 6;
    static MENU_RX: number = 8;
    static MENU_BG_COLOR: string = '#676767';
    static MENU_ICON_COLOR: string = '#e5e5e5';
    static MENU_ICON_HIGHLIGHT_COLOR: string = '#494949';
    static EFFECT_FADE: string = 'fade';
    static EFFECT_WIPE: string = 'wipe';
    static EFFECT_WHEEL: string = 'wheel';
    static EFFECT_CIRCLE: string = 'circle';
    static EFFECT_GROW: string = 'grow';
    static EASING_LINEAR: string = 'easeLinear';
    static EASING_IN_QUAD: string = 'easeInQuad';
    static EASING_OUT_QUAD: string = 'easeOutQuad';
    static EASING_INOUT_QUAD: string = 'easeInOutQuad';
    static EASING_IN_CUBIC: string = 'easeInCubic';
    static EASING_OUT_CUBIC: string = 'easeOutCubic';
    static EASING_INOUT_CUBIC: string = 'easeInOutCubic';
    static DURATION: string = 'duration';

    public action: any;
    public groupId: number;
    public container: SVGGElement;
    public mask: SVGRectElement;

    constructor(action: any, groupId: number) {
        this.action = action;
        this.groupId = groupId;
    }

    public createAndRenderMenu(): SVGGElement {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.classList.add('ease-fade');
        this.container.setAttributeNS(null, 'opacity', '0');
        const menuBg: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        menuBg.setAttributeNS(null, 'fill', GroupMenu.MENU_BG_COLOR);
        menuBg.setAttributeNS(null, 'd', `M0,0 H${GroupMenu.BTN_SIZE + GroupMenu.PADDING_LEFT + GroupMenu.PADDING - GroupMenu.MENU_RX} A${GroupMenu.MENU_RX} ${GroupMenu.MENU_RX} ${Math.PI / 2} 0 1 ${GroupMenu.BTN_SIZE + GroupMenu.PADDING_LEFT + GroupMenu.PADDING},${GroupMenu.MENU_RX} V${3 * GroupMenu.BTN_SIZE + 6 * GroupMenu.PADDING - GroupMenu.MENU_RX} A${GroupMenu.MENU_RX} ${GroupMenu.MENU_RX} ${Math.PI / 2} 0 1 ${GroupMenu.BTN_SIZE + GroupMenu.PADDING_LEFT + GroupMenu.PADDING - GroupMenu.MENU_RX},${3 * GroupMenu.BTN_SIZE + 6 * GroupMenu.PADDING} H0 Z`)
        this.container.appendChild(menuBg);

        console.log(this.action);
        const effectTypeBtn: SVGGElement = this.createBtn(this.action.animationType);
        effectTypeBtn.setAttributeNS(null, 'transform', `translate(${GroupMenu.PADDING_LEFT}, ${GroupMenu.PADDING})`);
        this.container.appendChild(effectTypeBtn);
        this.container.appendChild(this.createSplit(1));
        const easingBtn: SVGGElement = this.createBtn(this.action.easing);
        easingBtn.setAttributeNS(null, 'transform', `translate(${GroupMenu.PADDING_LEFT}, ${3 * GroupMenu.PADDING + GroupMenu.BTN_SIZE})`);
        this.container.appendChild(easingBtn);
        this.container.appendChild(this.createSplit(2));
        const durationBtn: SVGGElement = this.createBtn(GroupMenu.DURATION, this.action.duration);
        durationBtn.setAttributeNS(null, 'transform', `translate(${GroupMenu.PADDING_LEFT}, ${5 * GroupMenu.PADDING + 2 * GroupMenu.BTN_SIZE})`);
        this.container.appendChild(durationBtn);

        return this.container;
    }

    public showMenu() {
        this.container.setAttributeNS(null, 'opacity', '1');
    }

    public hideMenu() {
        this.container.setAttributeNS(null, 'opacity', '0');
    }

    public updatePosition(parentOffset: number, parentHeight: number) {
        this.container.setAttributeNS(null, 'transform', `translate(${parentOffset}, ${parentHeight / 2 - (3 * GroupMenu.BTN_SIZE + 6 * GroupMenu.PADDING) / 2})`)
    }

    public createBtn(btnType: string, duration?: number): SVGGElement {
        const btnContainer: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        btnContainer.classList.add('menu-btn');
        const btnBg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        btnBg.setAttributeNS(null, 'width', `${GroupMenu.BTN_SIZE}`);
        btnBg.setAttributeNS(null, 'height', `${GroupMenu.BTN_SIZE}`);
        btnBg.setAttributeNS(null, 'fill', GroupMenu.MENU_BG_COLOR);
        btnContainer.appendChild(btnBg);
        const icon: SVGPathElement = this.createBtnIcon(btnType);
        btnContainer.appendChild(icon);
        btnContainer.onmouseover = () => {
            icon.setAttributeNS(null, 'fill', GroupMenu.MENU_ICON_HIGHLIGHT_COLOR);
            //
        }
        btnContainer.onmouseout = () => {
            icon.setAttributeNS(null, 'fill', GroupMenu.MENU_ICON_COLOR);
        }
        return btnContainer;
    }

    public createBtnIcon(btnType: string): SVGPathElement {
        const icon: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        icon.setAttributeNS(null, 'fill', GroupMenu.MENU_ICON_COLOR);
        switch (btnType) {
            case GroupMenu.EFFECT_FADE:
                icon.setAttributeNS(null, 'd', 'M7.37,0.29C7.09,0.31,6.82,0.35,6.55,0.41v15.19c0.27,0.05,0.54,0.09,0.82,0.12V0.29z M3.45,14.18c0.26,0.2,0.53,0.38,0.82,0.54V1.27C3.98,1.44,3.71,1.62,3.45,1.82V14.18z M5.82,0.59C5.54,0.68,5.26,0.79,5,0.9v14.2c0.27,0.12,0.54,0.22,0.82,0.31V0.59z M1.17,4.56C0.65,5.6,0.35,6.76,0.35,8s0.3,2.4,0.82,3.44V4.56z M8.1,0.25C8.1,0.25,8.1,0.25,8.1,0.25l0,15.5c0,0,0,0,0,0c4.27,0,7.75-3.48,7.75-7.75S12.37,0.25,8.1,0.25z M2.72,2.44c-0.3,0.29-0.57,0.6-0.82,0.93v9.26c0.25,0.33,0.52,0.65,0.82,0.93V2.44z');
                break;
            case GroupMenu.EFFECT_WIPE://wipe life for now
                icon.setAttributeNS(null, 'd', 'M8,0.25C3.73,0.25,0.25,3.73,0.25,8c0,4.27,3.48,7.75,7.75,7.75c4.27,0,7.75-3.48,7.75-7.75C15.75,3.73,12.27,0.25,8,0.25z M8,15c-1.01,0-1.97-0.22-2.84-0.61V8.38c0,0,0,0,0,0h5.44l-2.58,2.39l0.56,0.6L12.21,8L8.58,4.63l-0.56,0.6l2.58,2.39H5.16c0,0,0,0,0,0V1.61C6.03,1.22,6.99,1,8,1c3.86,0,7,3.14,7,7S11.86,15,8,15z');
                break;
            case GroupMenu.EFFECT_GROW:
                icon.setAttributeNS(null, 'd', 'M8,0.25C3.73,0.25,0.25,3.73,0.25,8c0,4.27,3.48,7.75,7.75,7.75c4.27,0,7.75-3.48,7.75-7.75C15.75,3.73,12.27,0.25,8,0.25z M8,15c-3.86,0-7-3.14-7-7s3.14-7,7-7s7,3.14,7,7S11.86,15,8,15z M13.99,7.91c0-0.13-0.12-0.24-0.25-0.24H8.17c-0.14,0-0.25,0.11-0.25,0.25V9.9c0,0.14,0.11,0.25,0.25,0.25h2.79c-0.25,0.43-0.56,0.75-0.93,0.97C9.58,11.41,9,11.55,8.32,11.55c-1.06,0-1.93-0.34-2.65-1.04C5.1,9.95,4.78,9.31,4.66,8.57l0.8,0.65l0.17-0.21L4.57,8.14C4.54,8.1,4.5,8.07,4.46,8.05l-0.1-0.08L4.3,8.04c-0.11,0.03-0.2,0.13-0.19,0.25c0,0.01,0,0.01,0,0.02L3.41,9.32l0.23,0.16l0.55-0.78c0.14,0.82,0.52,1.56,1.14,2.17c0.81,0.79,1.82,1.18,3,1.18c0.77,0,1.44-0.17,1.97-0.5c0.54-0.33,0.98-0.85,1.31-1.54c0.04-0.08,0.03-0.17-0.02-0.24s-0.13-0.12-0.21-0.12H8.42V8.17h5.08l0.01,0.22c0,0.92-0.24,1.8-0.72,2.63c-0.48,0.82-1.1,1.46-1.86,1.9c-0.76,0.43-1.66,0.65-2.68,0.65c-1.1,0-2.09-0.24-2.95-0.72c-0.86-0.47-1.54-1.16-2.04-2.04C2.75,9.93,2.5,8.96,2.5,7.94c0-1.4,0.47-2.63,1.39-3.66c1.09-1.23,2.54-1.85,4.3-1.85c0.92,0,1.8,0.17,2.6,0.51c0.61,0.26,1.23,0.7,1.83,1.32l-1.13,1.12C10.54,4.46,9.43,4,8.2,4C8.06,4,7.95,4.11,7.95,4.25S8.06,4.5,8.2,4.5c1.19,0,2.2,0.46,3.1,1.41c0.05,0.05,0.11,0.08,0.18,0.08c0.09,0,0.13-0.02,0.18-0.07l1.48-1.47c0.1-0.09,0.1-0.25,0.01-0.35c-0.7-0.76-1.43-1.3-2.16-1.61c-0.87-0.37-1.81-0.55-2.8-0.55c-1.91,0-3.48,0.68-4.67,2.02C2.51,5.08,2,6.42,2,7.94c0,1.11,0.28,2.16,0.82,3.11c0.54,0.96,1.3,1.71,2.23,2.23c0.93,0.52,2.01,0.78,3.2,0.78c1.11,0,2.1-0.24,2.93-0.72c0.83-0.48,1.52-1.18,2.04-2.08C13.74,10.36,14,9.4,14,8.38L13.99,7.91z');
                break;
            case GroupMenu.EFFECT_WHEEL:
                icon.setAttributeNS(null, 'd', 'M8,0.25C3.73,0.25,0.25,3.73,0.25,8c0,4.27,3.48,7.75,7.75,7.75c4.27,0,7.75-3.48,7.75-7.75C15.75,3.73,12.27,0.25,8,0.25z M8,1c0,2.33,0,4.67,0,7c-1.91,1.33-3.83,2.66-5.74,4C1.47,10.86,1,9.49,1,8C1,4.14,4.14,1,8,1z M4.04,10.45c0.04,0,0.08-0.01,0.12-0.03c0.12-0.07,0.16-0.22,0.1-0.34C3.9,9.44,3.71,8.72,3.71,8c0-1.87,1.25-3.52,3.01-4.08L5.98,5.21L6.29,5.4L7.4,3.5L7.16,3.39C7.14,3.37,7.12,3.36,7.09,3.35L5.43,2.54L5.27,2.87L6.5,3.47C4.58,4.11,3.21,5.94,3.21,8c0,0.81,0.21,1.61,0.6,2.32C3.87,10.4,3.95,10.45,4.04,10.45z');
                break;
            case GroupMenu.EASING_LINEAR:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.09,0-0.19-0.04-0.26-0.11c-0.15-0.14-0.15-0.38-0.01-0.53l8.18-8.38c0.15-0.15,0.38-0.15,0.53-0.01c0.15,0.14,0.15,0.38,0.01,0.53l-8.18,8.38C4.22,12.89,4.12,12.92,4.02,12.92z M11.93,14.87H4.29c-1.74,0-3.15-1.42-3.15-3.15V4.07c0-1.74,1.41-3.15,3.15-3.15h7.64c1.74,0,3.15,1.41,3.15,3.15v7.64C15.09,13.46,13.67,14.87,11.93,14.87z M4.29,1.67c-1.33,0-2.4,1.08-2.4,2.4v7.64c0,1.33,1.08,2.4,2.4,2.4h7.64c1.33,0,2.4-1.08,2.4-2.4V4.07c0-1.33-1.08-2.4-2.4-2.4H4.29z');
                break;
            case GroupMenu.EASING_IN_QUAD:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.15,0-0.3-0.1-0.35-0.25C3.6,12.48,3.7,12.26,3.9,12.2c0.61-0.22,1.21-0.48,1.77-0.79c3.42-1.87,5.25-5.04,6.19-7.37c0.08-0.19,0.3-0.28,0.49-0.21c0.19,0.08,0.29,0.3,0.21,0.49c-0.98,2.44-2.91,5.77-6.52,7.75c-0.6,0.33-1.23,0.61-1.88,0.84C4.1,12.92,4.06,12.92,4.02,12.92z M11.93,14.5H4.29c-1.53,0-2.78-1.24-2.78-2.78V4.07c0-1.53,1.24-2.78,2.78-2.78h7.64c1.53,0,2.78,1.24,2.78,2.78v7.64C14.71,13.25,13.47,14.5,11.93,14.5z');
                break;
            case GroupMenu.EASING_OUT_QUAD:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.03,0-0.06,0-0.08-0.01c-0.2-0.05-0.33-0.25-0.28-0.45c0.32-1.4,1.68-6.13,5.89-7.98c0.82-0.36,1.7-0.59,2.62-0.69c0.22-0.02,0.39,0.13,0.41,0.33s-0.13,0.39-0.33,0.41c-0.84,0.09-1.65,0.3-2.4,0.63c-3.89,1.71-5.16,6.14-5.46,7.46C4.35,12.81,4.19,12.92,4.02,12.92z M11.93,14.87H4.29c-1.74,0-3.15-1.42-3.15-3.15V4.07c0-1.74,1.41-3.15,3.15-3.15h7.64c1.74,0,3.15,1.41,3.15,3.15v7.64C15.09,13.46,13.67,14.87,11.93,14.87z M4.29,1.67c-1.33,0-2.4,1.08-2.4,2.4v7.64c0,1.33,1.08,2.4,2.4,2.4h7.64c1.33,0,2.4-1.08,2.4-2.4V4.07c0-1.33-1.08-2.4-2.4-2.4H4.29z');
                break;
            case GroupMenu.EASING_INOUT_QUAD:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.18,0-0.35-0.14-0.37-0.32c-0.03-0.21,0.12-0.39,0.32-0.42c1.02-0.14,1.84-0.5,2.46-1.08c0.93-0.87,1.17-2.06,1.4-3.2c0.25-1.25,0.51-2.53,1.64-3.37C10.18,4,11.1,3.76,12.22,3.79c0.21,0.01,0.37,0.18,0.36,0.39c-0.01,0.21-0.2,0.36-0.39,0.36c-0.96-0.03-1.71,0.16-2.27,0.58C9.02,5.8,8.81,6.84,8.56,8.05c-0.24,1.21-0.52,2.57-1.63,3.6c-0.73,0.68-1.69,1.11-2.87,1.27C4.05,12.92,4.04,12.92,4.02,12.92z M11.93,14.87H4.29c-1.74,0-3.15-1.42-3.15-3.15V4.07c0-1.74,1.41-3.15,3.15-3.15h7.64c1.74,0,3.15,1.41,3.15,3.15v7.64C15.09,13.46,13.67,14.87,11.93,14.87z M4.29,1.67c-1.33,0-2.4,1.08-2.4,2.4v7.64c0,1.33,1.08,2.4,2.4,2.4h7.64c1.33,0,2.4-1.08,2.4-2.4V4.07c0-1.33-1.08-2.4-2.4-2.4H4.29z');
                break;
            case GroupMenu.EASING_IN_CUBIC:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.15,0-0.3-0.1-0.35-0.25C3.6,12.48,3.7,12.26,3.9,12.2c0.61-0.22,1.21-0.48,1.77-0.79c3.42-1.87,5.25-5.04,6.19-7.37c0.08-0.19,0.3-0.28,0.49-0.21c0.19,0.08,0.29,0.3,0.21,0.49c-0.98,2.44-2.91,5.77-6.52,7.75c-0.6,0.33-1.23,0.61-1.88,0.84C4.1,12.92,4.06,12.92,4.02,12.92z M11.93,14.5H4.29c-1.53,0-2.78-1.24-2.78-2.78V4.07c0-1.53,1.24-2.78,2.78-2.78h7.64c1.53,0,2.78,1.24,2.78,2.78v7.64C14.71,13.25,13.47,14.5,11.93,14.5z');
                break;
            case GroupMenu.EASING_OUT_CUBIC:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.03,0-0.06,0-0.08-0.01c-0.2-0.05-0.33-0.25-0.28-0.45c0.32-1.4,1.68-6.13,5.89-7.98c0.82-0.36,1.7-0.59,2.62-0.69c0.22-0.02,0.39,0.13,0.41,0.33s-0.13,0.39-0.33,0.41c-0.84,0.09-1.65,0.3-2.4,0.63c-3.89,1.71-5.16,6.14-5.46,7.46C4.35,12.81,4.19,12.92,4.02,12.92z M11.93,14.87H4.29c-1.74,0-3.15-1.42-3.15-3.15V4.07c0-1.74,1.41-3.15,3.15-3.15h7.64c1.74,0,3.15,1.41,3.15,3.15v7.64C15.09,13.46,13.67,14.87,11.93,14.87z M4.29,1.67c-1.33,0-2.4,1.08-2.4,2.4v7.64c0,1.33,1.08,2.4,2.4,2.4h7.64c1.33,0,2.4-1.08,2.4-2.4V4.07c0-1.33-1.08-2.4-2.4-2.4H4.29z');
                break;
            case GroupMenu.EASING_INOUT_CUBIC:
                icon.setAttributeNS(null, 'd', 'M4.02,12.92c-0.18,0-0.35-0.14-0.37-0.32c-0.03-0.21,0.12-0.39,0.32-0.42c1.02-0.14,1.84-0.5,2.46-1.08c0.93-0.87,1.17-2.06,1.4-3.2c0.25-1.25,0.51-2.53,1.64-3.37C10.18,4,11.1,3.76,12.22,3.79c0.21,0.01,0.37,0.18,0.36,0.39c-0.01,0.21-0.2,0.36-0.39,0.36c-0.96-0.03-1.71,0.16-2.27,0.58C9.02,5.8,8.81,6.84,8.56,8.05c-0.24,1.21-0.52,2.57-1.63,3.6c-0.73,0.68-1.69,1.11-2.87,1.27C4.05,12.92,4.04,12.92,4.02,12.92z M11.93,14.87H4.29c-1.74,0-3.15-1.42-3.15-3.15V4.07c0-1.74,1.41-3.15,3.15-3.15h7.64c1.74,0,3.15,1.41,3.15,3.15v7.64C15.09,13.46,13.67,14.87,11.93,14.87z M4.29,1.67c-1.33,0-2.4,1.08-2.4,2.4v7.64c0,1.33,1.08,2.4,2.4,2.4h7.64c1.33,0,2.4-1.08,2.4-2.4V4.07c0-1.33-1.08-2.4-2.4-2.4H4.29z');
                break;
            case GroupMenu.DURATION:
                icon.setAttributeNS(null, 'd', 'M8.26,0.68C8.17,0.67,8.09,0.65,8,0.65c-4.12,0-7.46,3.34-7.46,7.46c0,4.12,3.34,7.46,7.46,7.46c2.54,0,4.78-1.28,6.12-3.22c0.84-1.2,1.33-2.66,1.33-4.24C15.46,4.08,12.26,0.82,8.26,0.68z M8,14.81c-3.7,0-6.71-3.01-6.71-6.71c0-3.53,2.75-6.44,6.22-6.69v6.7V8.5l0.31,0.22l1.41,1.02l3.82,2.76C11.79,13.96,9.95,14.81,8,14.81z M13.32,11.8c-0.07,0.1-0.19,0.16-0.3,0.16c-0.08,0-0.15-0.02-0.22-0.07L7.84,8.31V2.03c0-0.21,0.17-0.38,0.38-0.38s0.38,0.17,0.38,0.38v5.9l4.64,3.35C13.4,11.39,13.44,11.63,13.32,11.8z');
                break;
            default:
        }
        return icon;
    }

    public createSplit(idx: number): SVGLineElement {
        const splitLine: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        splitLine.setAttributeNS(null, 'stroke', GroupMenu.MENU_ICON_COLOR);
        splitLine.setAttributeNS(null, 'stroke-width', '.6');
        splitLine.setAttributeNS(null, 'x1', `${GroupMenu.PADDING_LEFT}`);
        splitLine.setAttributeNS(null, 'x2', `${GroupMenu.PADDING_LEFT + GroupMenu.BTN_SIZE}`);
        splitLine.setAttributeNS(null, 'y1', `${idx * (2 * GroupMenu.PADDING + GroupMenu.BTN_SIZE)}`);
        splitLine.setAttributeNS(null, 'y2', `${idx * (2 * GroupMenu.PADDING + GroupMenu.BTN_SIZE)} `);
        return splitLine;
    }
}
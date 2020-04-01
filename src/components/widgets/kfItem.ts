import '../../assets/style/keyframeItem.scss'
import Tool from '../../util/tool'
import { IKeyframe } from '../../app/ds';
import KfGroup from './kfGroup';
import KfTimingIllus from './kfTimingIllus';
import KfOmit from './kfOmit';
import { ICoord } from '../../util/ds';
import IntelliRefLine from './intelliRefLine';
import { KfContainer } from '../kfContainer';
import * as action from '../../app/action';
import Reducer from '../../app/reducer';
import { TimingSpec } from 'canis_toolkit';

export default class KfItem extends KfTimingIllus {
    static KF_HEIGHT: number = 178;
    static KF_WIDTH: number = 240;
    static KF_H_STEP: number = 6;
    static KF_W_STEP: number = 8;
    static PADDING: number = 6;
    static allKfInfo: Map<number, IKeyframe> = new Map();
    static allKfItems: Map<number, KfItem> = new Map();
    static dragoverKf: KfItem;

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

    public totalWidth: number = 0
    public chartThumbnail: SVGImageElement

    public static highlightKfs(selectedCls: string[]) {
        //filter which kf to highlight

    }

    public static cancelHighlightKfs() {
        this.allKfItems.forEach((kf: KfItem) => {
            if (kf.isHighlighted) {
                kf.cancelHighlightKf();
            }
        })
    }

    public createStaticItem(staticMarks: string[]): void {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${KfItem.PADDING}, ${KfItem.PADDING})`);
        this.kfHeight = KfItem.KF_HEIGHT - 2 * KfItem.PADDING;
        this.drawKfBg(0);
        this.container.appendChild(this.kfBg);
        if (staticMarks.length > 0) {
            this.drawStaticChart(staticMarks);
            this.container.appendChild(this.chartThumbnail);
        }
    }

    public createItem(kf: IKeyframe, treeLevel: number, parentObj: KfGroup, startX: number, size?: { w: number, h: number }): void {
        console.log('draw duration: ', kf.durationIcon);
        this.hasOffset = kf.delayIcon;
        this.hasDuration = kf.durationIcon;
        this.parentObj = parentObj;
        this.aniId = this.parentObj.aniId;
        if (this.parentObj.kfHasOffset !== this.hasOffset || this.parentObj.kfHasDuration !== this.hasDuration) {
            this.parentObj.updateParentKfHasTiming(this.hasOffset, this.hasDuration);
        }
        this.id = kf.id;
        this.treeLevel = treeLevel;

        if (typeof size !== 'undefined') {
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
        } else {
            KfItem.allKfItems.set(this.id, this);
        }
    }

    public renderItem(startX: number, size?: { w: number, h: number }) {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.classList.add('draggable-component');
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfItem.PADDING}, ${KfItem.PADDING})`);
        this.container.onmousedown = (downEvt) => {
            let oriMousePosi: ICoord = { x: downEvt.pageX, y: downEvt.pageY };
            this.container.setAttributeNS(null, '_transform', this.container.getAttributeNS(null, 'transform'));
            const containerBBox: DOMRect = this.container.getBoundingClientRect();
            this.parentObj.container.removeChild(this.container);
            const popKfContainer: HTMLElement = document.getElementById(KfContainer.KF_POPUP);
            const popKfContainerBbox: DOMRect = popKfContainer.getBoundingClientRect();
            popKfContainer.appendChild(this.container);
            //set new transform
            this.container.setAttributeNS(null, 'transform', `translate(${containerBBox.left - popKfContainerBbox.left}, ${containerBBox.top - popKfContainerBbox.top})`);
            let updateSpec: boolean = false;
            let actionType: string = '';
            let actionInfo: any = {};

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
                                preSibling.drawDuration(KfItem.minDuration, this.kfWidth, this.kfHeight);
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
                                preSibling.drawDuration(KfItem.minDuration, this.kfWidth, this.kfHeight);
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
        if (this.hasOffset) {
            this.drawOffset(this.kfInfo.delay, this.kfHeight, 0);
            this.container.appendChild(this.offsetIllus);
            this.totalWidth += this.offsetWidth;
        }
        this.drawKfBg(this.treeLevel, size);
        this.container.appendChild(this.kfBg);
        if (this.hasDuration) {
            this.drawDuration(this.kfInfo.duration, this.kfWidth, this.kfHeight);
            this.container.appendChild(this.durationIllus);
            this.totalWidth += this.durationWidth;
        }
        this.drawChart(this.kfInfo.allCurrentMarks, this.kfInfo.allGroupMarks, this.kfInfo.marksThisKf);
        this.container.appendChild(this.chartThumbnail);
        if (this.treeLevel === 1) {
            this.parentObj.container.insertBefore(this.container, this.parentObj.groupMenu.container);
        } else {
            this.parentObj.container.appendChild(this.container);
        }

        //if this kfItem is aligned to previous kfItems, update positions
        if (typeof this.kfInfo.alignTo !== 'undefined') {
            this.updateAlignPosi(this.kfInfo.alignTo);
            KfItem.allKfItems.set(this.id, this);
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
            KfItem.allKfItems.set(this.id, this);
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
        const alignedKfInfo: IKeyframe = KfItem.allKfInfo.get(alignTo);
        const alignedKfItem: KfItem = KfItem.allKfItems.get(alignTo);
        const alignedKfBgX: number = alignedKfItem.kfBg.getBoundingClientRect().left;
        const bgDiffX: number = Math.abs(currentPosiX - alignedKfBgX);
        if (currentPosiX > alignedKfBgX) { //translate aligned kf and its group
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
                        tmpKfItem.parentObj.translateGroup(tmpKfItem, bgDiffX);
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
                nextKf.parentObj.translateGroup(nextKf, transXForNextKf, true);
            }
        } else {//translate current kf
            const currentTransX: number = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform')).x;
            this.container.setAttributeNS(null, 'transform', `translate(${currentTransX + bgDiffX}, ${KfItem.PADDING})`);
            this.totalWidth += bgDiffX;
        }
        //update the refline
        IntelliRefLine.updateLine(alignTo);
    }

    public drawKfBg(treeLevel: number, size?: { w: number, h: number }): void {
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
        this.kfBg.setAttributeNS(null, 'class', 'highlight-kf');
    }

    public cancelHighlightKf() {
        this.kfBg.classList.remove('highlight-kf');
    }

    public dragSelOver() {
        this.kfBg.setAttributeNS(null, 'class', 'dragover-kf');
        KfItem.dragoverKf = this;
    }

    public dragSelOut() {
        this.kfBg.classList.remove('dragover-kf');
        KfItem.dragoverKf = undefined;
    }
}
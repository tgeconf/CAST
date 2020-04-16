import { KfContainer, kfContainer } from "../kfContainer";
import KfItem from "./kfItem";
import { ICoord } from "../../util/ds";
import { IKeyframe } from "../../app/core/ds";
import { TimingSpec } from "canis_toolkit";
import KfGroup from "./kfGroup";

export default class IntelliRefLine {
    static HIGHLIGHT_STROKE_COLOR: string = '#0e89e5';
    static STROKE_COLOR: string = '#676767';
    static idx: number = 0;
    static allLines: Map<number, IntelliRefLine> = new Map();//key: line id, value: IntelliRefLine Obj
    static kfLineMapping: Map<number, { theOtherEnd: number, lineId: number }> = new Map();//key: kf id, value: {theOtherEnd: kf on the other end of this line, lineId: id of the IntelliRefLine obj}

    public id: number;
    public container: HTMLElement;
    public line: SVGLineElement;

    public createLine(alignWithKfId: number, alignToKfId: number) {
        //judge whether the alignto kfgroup is merged to alignwith group
        const alignToKfGroup: KfGroup = KfItem.allKfItems.get(alignToKfId).parentObj.fetchAniGroup();
        console.log('alito group: ', alignToKfGroup);
        this.container = document.getElementById(KfContainer.KF_FG);
        this.id = IntelliRefLine.idx;
        IntelliRefLine.idx++;
        this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.line.setAttributeNS(null, 'stroke', IntelliRefLine.STROKE_COLOR);
        this.line.setAttributeNS(null, 'stroke-dasharray', '4 2');
        this.line.setAttributeNS(null, 'stroke-width', '1');
        this.container.appendChild(this.line);
        IntelliRefLine.allLines.set(this.id, this);
        IntelliRefLine.kfLineMapping.set(alignWithKfId, { theOtherEnd: alignToKfId, lineId: this.id });
        IntelliRefLine.kfLineMapping.set(alignToKfId, { theOtherEnd: alignWithKfId, lineId: this.id });

        IntelliRefLine.updateLine(alignWithKfId);
        if (alignToKfGroup.alignMerge) {
            this.hideLine();
        }
    }

    /**
     * update line position and size
     * @param kfId : either alignwith kf or alignto kf
     */
    public static updateLine(kfId: number) {
        if (typeof IntelliRefLine.kfLineMapping.get(kfId) !== 'undefined') {
            const lineItem: IntelliRefLine = IntelliRefLine.allLines.get(IntelliRefLine.kfLineMapping.get(kfId).lineId);
            // const containerBBox: DOMRect = document.getElementById(KfContainer.KF_BG).getBoundingClientRect();
            const containerBBox: DOMRect = lineItem.container.getBoundingClientRect();
            const alignKf1: IKeyframe = KfItem.allKfInfo.get(kfId);
            const alignKf2: IKeyframe = KfItem.allKfInfo.get(IntelliRefLine.kfLineMapping.get(kfId).theOtherEnd);
            let alignWithKfBBox: DOMRect, alignWithKfInfo: IKeyframe, alignToKfBBox: DOMRect, alignToKfInfo: IKeyframe;
            let testWith, testTo;
            if (typeof alignKf1.alignTo === 'undefined') {
                testWith = KfItem.allKfItems.get(alignKf1.id);
                testTo = KfItem.allKfItems.get(alignKf2.id);
                alignWithKfBBox = KfItem.allKfItems.get(alignKf1.id).container.getBoundingClientRect();
                alignToKfBBox = KfItem.allKfItems.get(alignKf2.id).container.getBoundingClientRect();
                alignWithKfInfo = alignKf1;
                alignToKfInfo = alignKf2;
            } else {
                testWith = KfItem.allKfItems.get(alignKf2.id);
                testTo = KfItem.allKfItems.get(alignKf1.id);
                alignWithKfBBox = KfItem.allKfItems.get(alignKf2.id).container.getBoundingClientRect();
                alignToKfBBox = KfItem.allKfItems.get(alignKf1.id).container.getBoundingClientRect();
                alignWithKfInfo = alignKf2;
                alignToKfInfo = alignKf1;
            }

            if (alignToKfInfo.timingRef === TimingSpec.timingRef.previousEnd) {
                lineItem.line.setAttributeNS(null, 'x1', `${alignWithKfBBox.right - containerBBox.left}`);
                lineItem.line.setAttributeNS(null, 'x2', `${alignWithKfBBox.right - containerBBox.left}`);
            } else {
                lineItem.line.setAttributeNS(null, 'x1', `${alignWithKfBBox.left - containerBBox.left}`);
                lineItem.line.setAttributeNS(null, 'x2', `${alignWithKfBBox.left - containerBBox.left}`);
            }

            // lineItem.line.setAttributeNS(null, 'y1', `${24}`);
            lineItem.line.setAttributeNS(null, 'y1', `${alignWithKfBBox.top - containerBBox.top}`);
            lineItem.line.setAttributeNS(null, 'y2', `${alignToKfBBox.bottom - containerBBox.top}`);
            lineItem.line.setAttributeNS(null, 'transform', '');
        }
    }

    public hideLine(): void {
        this.line.setAttributeNS(null, 'opacity', '0');
    }

    public showLine(): void {
        this.line.setAttributeNS(null, 'opacity', '1');
    }

    public hintInsert(targetPosi: ICoord, targetHeight: number, vertical: boolean = true) {
        this.container = document.getElementById(KfContainer.KF_FG);
        const containerBBox: DOMRect = document.getElementById(KfContainer.KF_CONTAINER).getBoundingClientRect();
        if (typeof this.line === 'undefined') {
            this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        }
        if (!this.container.contains(this.line)) {
            this.container.appendChild(this.line);
        }
        this.line.setAttributeNS(null, 'stroke', IntelliRefLine.HIGHLIGHT_STROKE_COLOR);
        this.line.setAttributeNS(null, 'stroke-width', '4');
        if (vertical) {
            this.line.setAttributeNS(null, 'x1', `${targetPosi.x - containerBBox.left - kfContainer.transDistance.w}`);
            this.line.setAttributeNS(null, 'y1', `${targetPosi.y - containerBBox.top - kfContainer.transDistance.h}`);
            this.line.setAttributeNS(null, 'x2', `${targetPosi.x - containerBBox.left - kfContainer.transDistance.w}`);
            this.line.setAttributeNS(null, 'y2', `${targetPosi.y - containerBBox.top + targetHeight - kfContainer.transDistance.h}`);
        }
    }

    public removeHintInsert() {
        if (typeof this.container !== 'undefined') {
            if (this.container.contains(this.line)) {
                this.container.removeChild(this.line);
            }
        }
    }
}

export let hintDrop: IntelliRefLine = new IntelliRefLine();
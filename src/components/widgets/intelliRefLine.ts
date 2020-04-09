import { KfContainer, kfContainer } from "../kfContainer";
import KfItem from "./kfItem";
import { ICoord } from "../../util/ds";

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
    }

    /**
     * update line position and size
     * @param kfId : either alignwith kf or alignto kf
     */
    public static updateLine(kfId: number) {
        if (typeof IntelliRefLine.kfLineMapping.get(kfId) !== 'undefined') {
            const lineItem: IntelliRefLine = IntelliRefLine.allLines.get(IntelliRefLine.kfLineMapping.get(kfId).lineId);
            const containerBBox: DOMRect = lineItem.container.getBoundingClientRect();
            const alignKf1BBox: DOMRect = KfItem.allKfItems.get(kfId).container.getBoundingClientRect();
            const alignKf2BBox: DOMRect = KfItem.allKfItems.get(IntelliRefLine.kfLineMapping.get(kfId).theOtherEnd).container.getBoundingClientRect();
            lineItem.line.setAttributeNS(null, 'x1', `${alignKf1BBox.left - containerBBox.left}`);
            lineItem.line.setAttributeNS(null, 'x2', `${alignKf1BBox.left - containerBBox.left}`);
            lineItem.line.setAttributeNS(null, 'y1', `${alignKf1BBox.top < alignKf2BBox.top ? (alignKf1BBox.top - containerBBox.top) : (alignKf2BBox.top - containerBBox.top)}`);
            lineItem.line.setAttributeNS(null, 'y2', `${alignKf1BBox.top < alignKf2BBox.top ? (alignKf2BBox.bottom - containerBBox.top) : (alignKf1BBox.bottom - containerBBox.top)}`);
        }
    }

    public hideLine(): void {
        this.line.setAttributeNS(null, 'opacity', '0');
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
            this.line.setAttributeNS(null, 'x1', `${targetPosi.x - containerBBox.left}`);
            this.line.setAttributeNS(null, 'y1', `${targetPosi.y - containerBBox.top}`);
            this.line.setAttributeNS(null, 'x2', `${targetPosi.x - containerBBox.left}`);
            this.line.setAttributeNS(null, 'y2', `${targetPosi.y - containerBBox.top + targetHeight}`);
        }
    }

    public removeHintInsert() {
        if (this.container.contains(this.line)) {
            this.container.removeChild(this.line);
        }
    }
}

export let hintDrop: IntelliRefLine = new IntelliRefLine();
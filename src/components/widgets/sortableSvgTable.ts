import { ICoord } from "../../util/ds";
import { KfContainer } from "../kfContainer";
import { state } from "../../app/state";
import KfGroup from "./kfGroup";

export default class SortableSvgTable {
    static TABLE_WIDTH: number = 200;
    static TABLE_PADDING: number = 6;
    static CELL_HEIGHT: number = 18;
    private data: string[];
    private correspondingKfg: KfGroup;
    private position: ICoord;

    public container: SVGGElement;

    /**
     * 
     * @param data : attribtue names used to do sorting 
     */
    public createTable(data: string[], position: ICoord, kfg: KfGroup) {
        this.data = data;
        this.position = position;
        this.correspondingKfg = kfg;
        this.renderTable();
    }

    private renderTable() {
        // this.removeTable();//make sure there are no exisiting tables 
        const svgHintLayer: HTMLElement = document.getElementById(KfContainer.KF_HINT);
        const layerBBox: DOMRect = document.getElementById(KfContainer.KF_FG).getBoundingClientRect();//fixed
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${(this.position.x - layerBBox.left) / state.zoomLevel}, ${(this.position.y - layerBBox.top) / state.zoomLevel})`);
        this.container.onmouseleave = () => {
            this.removeTable();
            this.correspondingKfg.transHideTitle();
        }
        const fakeBg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        fakeBg.setAttributeNS(null, 'x', '0');
        fakeBg.setAttributeNS(null, 'y', '0');
        fakeBg.setAttributeNS(null, 'width', `${SortableSvgTable.TABLE_WIDTH}`);
        fakeBg.setAttributeNS(null, 'height', `${SortableSvgTable.TABLE_WIDTH}`);
        fakeBg.setAttributeNS(null, 'fill', 'rgba(0,0,0,0.3)');
        this.container.appendChild(fakeBg);

        const pointer: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pointer.classList.add('drop-shadow-ele');
        pointer.setAttributeNS(null, 'd', 'M8,0 V12 L0,6 Z');
        pointer.setAttributeNS(null, 'transform', `translate(${SortableSvgTable.TABLE_PADDING}, 2)`);
        pointer.setAttributeNS(null, 'fill', '#383838');
        this.container.appendChild(pointer);

        const bg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.classList.add('drop-shadow-ele');
        bg.setAttributeNS(null, 'x', `${SortableSvgTable.TABLE_PADDING + 8}`);
        bg.setAttributeNS(null, 'y', '0');
        bg.setAttributeNS(null, 'width', `${SortableSvgTable.TABLE_WIDTH - SortableSvgTable.TABLE_PADDING - 8}`);
        bg.setAttributeNS(null, 'height', `${SortableSvgTable.TABLE_WIDTH}`);
        bg.setAttributeNS(null, 'stroke', '#383838');
        bg.setAttributeNS(null, 'fill', 'rgb(239, 239, 239)');
        bg.setAttributeNS(null, 'stroke-width', '1');
        this.container.appendChild(bg);

        //create list
        this.data.forEach((d: string, idx: number) => {
            const itemContainer: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            itemContainer.setAttributeNS(null, 'transform', `translate(${2 * SortableSvgTable.TABLE_PADDING + 8}, ${SortableSvgTable.TABLE_PADDING + idx * SortableSvgTable.CELL_HEIGHT})`);
            const itemBg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            itemBg.setAttributeNS(null, 'width', `${SortableSvgTable.TABLE_WIDTH - 3 * SortableSvgTable.TABLE_PADDING - 8}`);
            itemBg.setAttributeNS(null, 'height', `${SortableSvgTable.CELL_HEIGHT}`);
            itemBg.setAttributeNS(null, 'fill', '#f2f2f2');
            itemBg.setAttributeNS(null, 'stroke', '#a5a5a5');
            itemBg.setAttributeNS(null, 'stroke-width', '1');
            itemBg.setAttributeNS(null, 'stroke-dasharray', '4 2');
            itemContainer.appendChild(itemBg);
            const itemContent: SVGTextContentElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            itemContent.innerHTML = d;
            itemContent.setAttributeNS(null, 'font-size', '10pt');
            itemContent.setAttributeNS(null, 'fill', '#383838');
            itemContent.setAttributeNS(null, 'x', '6');
            itemContent.setAttributeNS(null, 'y', `${SortableSvgTable.CELL_HEIGHT - 4}`);
            itemContainer.appendChild(itemContent);
            this.container.appendChild(itemContainer);
        })

        svgHintLayer.appendChild(this.container);
    }

    public removeTable() {
        const svgHintLayer: HTMLElement = document.getElementById(KfContainer.KF_HINT);
        if (svgHintLayer.contains(this.container)) {
            svgHintLayer.removeChild(this.container);
        }
    }
}

export const sortableSvgTable: SortableSvgTable = new SortableSvgTable();
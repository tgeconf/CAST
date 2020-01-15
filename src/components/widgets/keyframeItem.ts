import '../../assets/style/keyframeItem.scss'
import Tool from '../../util/tool'

export default class KeyframeItem {
    public isContinued: boolean
    public highlightMarks: string[]

    //widgets
    public keyframeContainer: HTMLDivElement
    public canvas: HTMLCanvasElement

    public createItem(svg: HTMLElement): void {
        this.keyframeContainer = document.createElement('div');
        this.keyframeContainer.className = 'keyframe-item-container';
        this.canvas = document.createElement('canvas');
        this.canvas.width = 240;
        this.canvas.height = 150;
        Tool.svg2canvs(svg, this.canvas);
        this.keyframeContainer.appendChild(this.canvas);
    }

    public createEllipsis(): HTMLSpanElement {
        const ellipsisContainer: HTMLSpanElement = document.createElement('span');
        ellipsisContainer.className = 'ellipsis-container';
        ellipsisContainer.innerHTML = '...';
        return ellipsisContainer;
    }
}
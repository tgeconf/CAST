import '../../assets/style/suggestBox.scss'
import KfItem from "./kfItem";
import { kfContainer, KfContainer } from "../kfContainer";
import { state } from "../../app/state";
import { IPath, IKeyframe } from "../../app/core/ds";
import KfGroup from "./kfGroup";
import Tool from "../../util/tool";
import { ICoord } from "../../util/ds";
import Reducer from "../../app/reducer";
import * as action from "../../app/action";

interface IOptionInfo {
    kfIdx: number;
    attrs: string[]
    values: string[]
    marks: string[]
    allCurrentMarks: string[]
    allGroupMarks: string[]
    kfWidth: number
    kfHeight: number
    suggestOnFirstKf: boolean
}

export class SuggestBox {
    static PADDING: number = 6;
    static SHOWN_NUM: number = 2;
    static MENU_WIDTH: number = 20;

    public kfBeforeSuggestBox: KfItem;
    public uniqueKfIdx: number;
    public kfWidth: number = 240;
    public kfHeight: number = 178;
    public boxWidth: number = 240;
    public menuWidth: number = 0;
    public numShown: number = SuggestBox.SHOWN_NUM;
    public container: SVGGElement;
    public itemContainer: SVGGElement;
    public options: OptionItem[] = [];
    public createSuggestBox(kfBeforeSuggestBox: KfItem, uniqueKfIdx: number, suggestOnFirstKf: boolean) {
        this.kfBeforeSuggestBox = kfBeforeSuggestBox;
        this.uniqueKfIdx = uniqueKfIdx;
        this.kfWidth = this.kfBeforeSuggestBox.kfWidth - 2 * SuggestBox.PADDING * this.kfBeforeSuggestBox.kfWidth / this.kfBeforeSuggestBox.kfHeight;
        this.kfHeight = this.kfBeforeSuggestBox.kfHeight - 2 * SuggestBox.PADDING;
        this.boxWidth = this.kfWidth + 3 * SuggestBox.PADDING + OptionItem.TEXT_PANEL_WIDTH;
        const tmpKfInfo: IKeyframe = KfItem.allKfInfo.get(this.kfBeforeSuggestBox.id);
        this.createOptionKfs([...tmpKfInfo.allCurrentMarks, ...tmpKfInfo.marksThisKf], tmpKfInfo.allGroupMarks, suggestOnFirstKf);
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        if (this.options.length <= this.numShown) {
            this.numShown = this.options.length;
            this.menuWidth = 0;
        } else {
            this.numShown = SuggestBox.SHOWN_NUM;
            this.menuWidth = SuggestBox.MENU_WIDTH;
            let suggestMenu: SuggestMenu = new SuggestMenu();
            suggestMenu.createMenu({ x: this.boxWidth, y: this.kfHeight / 2 + SuggestBox.PADDING }, this);
            this.container.appendChild(suggestMenu.container);
        }

        const bgLayerBBox: DOMRect = document.getElementById(KfContainer.KF_POPUP).getBoundingClientRect();
        const preKfBBox: DOMRect = this.kfBeforeSuggestBox.container.getBoundingClientRect();
        this.container.setAttributeNS(null, 'transform', `translate(${preKfBBox.right - bgLayerBBox.left + SuggestBox.PADDING}, ${preKfBBox.top - bgLayerBBox.top})`);
        const bg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttributeNS(null, 'width', `${this.boxWidth}`);
        bg.setAttributeNS(null, 'height', `${(this.kfHeight + 2 * SuggestBox.PADDING) * this.numShown}`);
        bg.setAttributeNS(null, 'fill', '#c9caca');
        bg.setAttributeNS(null, 'stroke', '#676767');
        bg.setAttributeNS(null, 'rx', `${KfGroup.GROUP_RX}`);
        this.container.appendChild(bg);

        this.itemContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.appendChild(this.itemContainer);
        for (let i = 0; i < this.numShown; i++) {
            this.options[i].updateTrans(i);
            this.itemContainer.appendChild(this.options[i].container);
        }

        const popupLayer: HTMLElement = document.getElementById(KfContainer.KF_POPUP);
        popupLayer.appendChild(this.container);
    }

    public removeSuggestBox() {
        const popupLayer: HTMLElement = document.getElementById(KfContainer.KF_POPUP);
        if (popupLayer.contains(this.container)) {
            popupLayer.removeChild(this.container);
        }
        this.options = [];
    }

    public createOptionKfs(allCurrentMarks: string[], allGroupMarks: string[], suggestOnFirstKf: boolean): void {
        let uniqueKfRecorder: string[][] = [];//record unique kfs
        state.allPaths.forEach((path: IPath) => {
            const marksThisKf: string[] = path.kfMarks[this.uniqueKfIdx];
            if (!Tool.Array2DItem(uniqueKfRecorder, marksThisKf)) {
                uniqueKfRecorder.push(marksThisKf);
                let optionInfo: IOptionInfo = {
                    kfIdx: this.uniqueKfIdx,
                    attrs: path.attrComb,
                    values: path.sortedAttrValueComb[this.uniqueKfIdx + 1].split(','),
                    marks: marksThisKf,
                    allCurrentMarks: allCurrentMarks,
                    allGroupMarks: allGroupMarks,
                    kfWidth: this.kfWidth,
                    kfHeight: this.kfHeight,
                    suggestOnFirstKf: suggestOnFirstKf
                }

                let optionItem: OptionItem = new OptionItem();
                optionItem.createaItem(optionInfo);
                this.options.push(optionItem);
            }
        })
    }
}

export class SuggestMenu {
    static MENU_WIDTH: number = 20
    static MENU_RX: number = KfGroup.GROUP_RX;
    static MENU_ICON_COLOR: string = '#e5e5e5';
    static MENU_ICON_HIGHLIGHT_COLOR: string = '#494949';
    static BTN_SIZE: number = 20;
    static PADDING: number = 2;
    static DOT_SIZE: number = 10;
    static UP_DIRECT: string = 'up';
    static DOWN_DIRECT: string = 'down';

    public container: SVGGElement;
    public parentSuggestBox: SuggestBox;
    public numPages: number = 0;
    public pageIdx: number = 0;
    public dots: SVGCircleElement[] = [];
    public createMenu(startCoord: ICoord, suggestBox: SuggestBox) {
        this.parentSuggestBox = suggestBox;
        this.numPages = Math.ceil(this.parentSuggestBox.options.length / this.parentSuggestBox.numShown);
        const menuHeight: number = (SuggestMenu.BTN_SIZE + 2 * SuggestMenu.PADDING) * 2 + this.numPages * (SuggestMenu.DOT_SIZE + 2 * SuggestMenu.PADDING);
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${startCoord.x - SuggestMenu.MENU_RX}, ${startCoord.y - menuHeight / 2})`);
        const bg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttributeNS(null, 'width', `${SuggestMenu.MENU_RX + SuggestMenu.MENU_WIDTH}`);
        bg.setAttributeNS(null, 'height', `${menuHeight}`);
        bg.setAttributeNS(null, 'fill', '#676767');
        bg.setAttributeNS(null, 'rx', `${SuggestMenu.MENU_RX}`);
        this.container.appendChild(bg);

        const upArrow: SVGPolygonElement = this.createArrowBtn(SuggestMenu.UP_DIRECT, menuHeight);
        this.container.appendChild(upArrow);
        const downArrow: SVGPolygonElement = this.createArrowBtn(SuggestMenu.DOWN_DIRECT, menuHeight);
        this.container.appendChild(downArrow);

        this.dots = [];
        for (let i = 0; i < this.numPages; i++) {
            const tmpDot: SVGCircleElement = this.createDot(i);
            this.container.appendChild(tmpDot);
            this.dots.push(tmpDot);
        }
    }

    public createArrowBtn(direct: string, menuHeight: number): SVGPolygonElement {
        let arrow: SVGPolygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        // arrow.setAttributeNS(null, 'fill', SuggestMenu.MENU_ICON_COLOR);
        arrow.classList.add('clickable-component', 'normal-btn');
        switch (direct) {
            case SuggestMenu.UP_DIRECT:
                arrow.setAttributeNS(null, 'points', '9.76,2.41 16.46,17.59 9.76,14.68 3.12,17.59');
                arrow.setAttributeNS(null, 'transform', `translate(${SuggestMenu.MENU_RX}, ${SuggestMenu.PADDING})`);
                arrow.onclick = () => {
                    if (this.pageIdx > 0) {
                        this.pageIdx--;
                        this.arrowClickListener();
                    }
                }
                break;
            case SuggestMenu.DOWN_DIRECT:
                arrow.setAttributeNS(null, 'points', '3.12,2.41 9.76,5.32 16.46,2.41 9.76,17.59');
                arrow.setAttributeNS(null, 'transform', `translate(${SuggestMenu.MENU_RX}, ${menuHeight - SuggestMenu.BTN_SIZE - SuggestMenu.PADDING})`);
                arrow.onclick = () => {
                    if (this.pageIdx < this.numPages - 1) {
                        this.pageIdx++;
                        this.arrowClickListener();
                    }
                }
                break;
        }

        return arrow;
    }

    public arrowClickListener() {
        this.parentSuggestBox.itemContainer.innerHTML = '';
        for (let i = this.pageIdx * this.parentSuggestBox.numShown; i < (this.pageIdx + 1) * this.parentSuggestBox.numShown; i++) {
            if (typeof this.parentSuggestBox.options[i] !== 'undefined') {
                this.parentSuggestBox.options[i].updateTrans(i - this.pageIdx * this.parentSuggestBox.numShown);
                this.parentSuggestBox.itemContainer.appendChild(this.parentSuggestBox.options[i].container);
            }
        }
        this.dots.forEach((dot: SVGCircleElement, idx: number) => {
            if (idx === this.pageIdx) {
                dot.classList.add('highlight-btn')
            } else {
                dot.classList.remove('highlight-btn')
            }
        })
    }

    public createDot(idx: number): SVGCircleElement {
        let dot: SVGCircleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.classList.add('clickable-component', 'normal-btn');
        if (idx === 0) {
            dot.classList.add('clickable-component', 'highlight-btn');
        }
        dot.setAttributeNS(null, 'fill', SuggestMenu.MENU_ICON_COLOR);
        dot.setAttributeNS(null, 'r', `${SuggestMenu.BTN_SIZE / 2 - 6}`);
        dot.setAttributeNS(null, 'cx', `${SuggestMenu.MENU_RX + SuggestMenu.BTN_SIZE / 2}`);
        dot.setAttributeNS(null, 'cy', `${SuggestMenu.BTN_SIZE + SuggestMenu.PADDING * 3 + SuggestMenu.DOT_SIZE / 2 + (SuggestMenu.DOT_SIZE + 2 * SuggestMenu.PADDING) * idx}`);
        dot.onclick = () => {
            this.pageIdx = idx;
            this.arrowClickListener();
        }

        return dot;
    }
}

export class OptionItem {
    static PADDING: number = 6;
    static TEXT_PANEL_WIDTH: number = 60;

    public container: SVGGElement;
    public optionKf: KfItem;
    public createaItem(optionInfo: IOptionInfo) {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.classList.add('clickable-component');
        this.optionKf = new KfItem();
        this.optionKf.createOptionKfItem(optionInfo.allCurrentMarks, optionInfo.allGroupMarks, optionInfo.marks, optionInfo.kfWidth, optionInfo.kfHeight);
        const text: SVGTextElement = this.createText(optionInfo.attrs, optionInfo.values);
        const bg: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.classList.add('ease-fade', 'hide-ele');
        bg.setAttributeNS(null, 'width', `${this.optionKf.kfWidth + 3 * OptionItem.PADDING + OptionItem.TEXT_PANEL_WIDTH}`);
        bg.setAttributeNS(null, 'height', `${this.optionKf.kfHeight + 2 * OptionItem.PADDING}`);
        bg.setAttributeNS(null, 'rx', `${KfGroup.GROUP_RX}`);
        bg.setAttributeNS(null, 'fill', '#b6b6b6');
        this.container.appendChild(bg);
        this.container.appendChild(this.optionKf.container);
        this.container.appendChild(text);
        this.container.onmouseover = () => {
            if (!state.mousemoving) {
                bg.classList.remove('hide-ele');
            }
        }
        this.container.onmouseout = () => {
            bg.classList.add('hide-ele');
        }
        this.container.onclick = () => {
            //filter paths
            let tmpAllPaths: IPath[] = [];
            state.allPaths.forEach((p: IPath) => {
                if (Tool.identicalArrays(p.kfMarks[optionInfo.kfIdx], optionInfo.marks)) {
                    tmpAllPaths.push(p);
                }
            })

            //remove suggest box and create a new kf
            const startKfInfo: IKeyframe = KfItem.allKfInfo.get(suggestBox.kfBeforeSuggestBox.id);
            const tmpKfInfo: IKeyframe = KfItem.createKfInfo(optionInfo.marks,
                {
                    duration: startKfInfo.duration,
                    allCurrentMarks: [...startKfInfo.allCurrentMarks, ...startKfInfo.marksThisKf],
                    allGroupMarks: startKfInfo.allGroupMarks
                });
            KfItem.allKfInfo.set(tmpKfInfo.id, tmpKfInfo);
            let tmpKf: KfItem = new KfItem();
            const startX: number = Tool.extractTransNums(suggestBox.kfBeforeSuggestBox.container.getAttributeNS(null, 'transform')).x + suggestBox.kfBeforeSuggestBox.totalWidth - KfItem.PADDING;
            tmpKf.createItem(tmpKfInfo, suggestBox.kfBeforeSuggestBox.parentObj.treeLevel + 1, suggestBox.kfBeforeSuggestBox.parentObj, startX);
            let insertIdx: number = 0;
            for (let i = 0, len = suggestBox.kfBeforeSuggestBox.parentObj.children.length; i < len; i++) {
                if (suggestBox.kfBeforeSuggestBox.parentObj.children[i] instanceof KfItem && suggestBox.kfBeforeSuggestBox.parentObj.children[i].id === suggestBox.kfBeforeSuggestBox.id) {
                    insertIdx = i + 1;
                    break;
                }
            }
            let nextKf: KfItem = suggestBox.kfBeforeSuggestBox.parentObj.children[insertIdx];
            suggestBox.kfBeforeSuggestBox.parentObj.children.splice(insertIdx, 0, tmpKf);
            let transX: number = tmpKf.totalWidth - (suggestBox.boxWidth + 3 * SuggestBox.PADDING + suggestBox.menuWidth + 2);
            if (typeof nextKf === 'undefined') {
                suggestBox.kfBeforeSuggestBox.parentObj.translateGroup(tmpKf, transX, false, false, false, { lastItem: true, extraWidth: suggestBox.boxWidth + SuggestBox.PADDING + suggestBox.menuWidth });
            } else {
                suggestBox.kfBeforeSuggestBox.parentObj.translateGroup(nextKf, transX, false, false, false);
            }
            suggestBox.removeSuggestBox();

            //triger actions to render again
            Reducer.triger(action.UPDATE_SUGGESTION_PATH, { ap: tmpAllPaths, kfIdxInPath: suggestBox.uniqueKfIdx, startKf: tmpKf, suggestOnFirstKf: optionInfo.suggestOnFirstKf, selectedMarks: optionInfo.marks });
        }
    }

    /**
     * 
     * @param index : index of this item in the shown items
     */
    public updateTrans(index: number) {
        this.container.setAttributeNS(null, 'transform', `translate(0, ${index * (this.optionKf.kfHeight + 2 * OptionItem.PADDING)})`);
    }

    public createText(attrs: string[], values: string[]): SVGTextElement {
        const text: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttributeNS(null, 'transform', `translate(${this.optionKf.kfWidth + 2 * OptionItem.PADDING}, ${3 * OptionItem.PADDING})`)
        text.classList.add('monospace-font', 'small-font');
        attrs.forEach((aName: string, idx: number) => {
            const aNameTspan: SVGTSpanElement = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            aNameTspan.innerHTML = `${aName}:`;
            aNameTspan.setAttributeNS(null, 'font-weight', 'bold');
            aNameTspan.setAttributeNS(null, 'x', '0');
            aNameTspan.setAttributeNS(null, 'y', `${idx * 38}`);
            text.appendChild(aNameTspan);
            const aValueTspan: SVGTSpanElement = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            aValueTspan.innerHTML = values[idx];
            aValueTspan.setAttributeNS(null, 'x', '0');
            aValueTspan.setAttributeNS(null, 'y', `${idx * 38 + 16}`);
            text.appendChild(aValueTspan);
        })
        return text;
    }
}

export let suggestBox: SuggestBox = new SuggestBox();
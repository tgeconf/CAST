import KfGroup from "./kfGroup";
import { Animation, ChartSpec } from 'canis_toolkit';
import Tool from "../../util/tool";
import KfItem from "./kfItem";
import { state } from "../../app/state";
import { IKeyframe } from "../../app/core/ds";
import Reducer from "../../app/reducer";
import * as action from "../../app/action";
import Suggest from "../../app/core/suggest";
import Util from "../../app/core/util";
import KfTrack from "./kfTrack";
import { ICoord, ISize } from "../../util/ds";

export default class PlusBtn {
    static BTN_SIZE: number = 16;
    static PADDING: number = 6;
    static BTN_COLOR: string = '#9fa0a0';
    static BTN_HIGHLIGHT_COLOR: string = '#358bcb';
    static BTN_DRAGOVER_COLOR: string = '#ea5514';
    static allPlusBtn: PlusBtn[] = [];
    static dragoverBtn: PlusBtn;
    static BTN_IDX: number = 0;

    // public parentObj: KfGroup;
    public parentTrack: KfTrack;
    public targetKfg: KfGroup;
    public firstKfArrInTargetKfg: IKeyframe[];
    public fakeKfg: KfGroup;
    public id: number;
    public kfSize: ISize
    public acceptableCls: string[];
    public isHighlighted: boolean = false;
    public container: SVGGElement;
    public btnBg: SVGRectElement;
    public btnIcon: SVGTextElement;

    public static highlightPlusBtns(selectedCls: string[]) {
        //filter which button to highlight (has the same accepatable classes)
        this.allPlusBtn.forEach((pb: PlusBtn) => {
            if (Tool.arrayContained(pb.acceptableCls, selectedCls)) {
                pb.highlightBtn();
                let transX: number = pb.kfSize.w - this.BTN_SIZE;
                pb.targetKfg.translateWholeGroup(transX, true);
            }
        })
    }

    public static cancelHighlightPlusBtns() {
        console.log('cancel highlight plu btn: ', this.allPlusBtn);
        this.allPlusBtn.forEach((pb: PlusBtn) => {
            if (pb.isHighlighted) {
                pb.cancelHighlightBtn();
                let transX: number = pb.kfSize.w - this.BTN_SIZE;
                console.log('transalteing target kfg: ', pb.targetKfg, -transX);
                pb.targetKfg.translateWholeGroup(-transX, true);
            }
        })
    }

    public static detectAdding(kfs: IKeyframe[]): [boolean, string[]] {
        const kf0Marks = kfs[0].marksThisKf;
        let mClassCount: string[] = [];
        kf0Marks.forEach((mId: string) => {
            mClassCount.push(Animation.markClass.get(mId));
        })
        mClassCount = [...new Set(mClassCount)];
        if (mClassCount.length === 1) {
            let allDataEncoded: boolean = true;
            let hasDiffAttrValue: boolean = false;
            let datum0: any = ChartSpec.dataMarkDatum.get(kf0Marks[0]);
            for (let i = 1, len = kf0Marks.length; i < len; i++) {
                if (typeof ChartSpec.dataMarkDatum.get(kf0Marks[i]) === 'undefined') {
                    allDataEncoded = false;
                    break;
                } else {
                    const datum: any = ChartSpec.dataMarkDatum.get(kf0Marks[i]);
                    for (let key in datum) {
                        if (datum[key] !== datum0[key] && typeof datum0[key] !== 'undefined') {
                            hasDiffAttrValue = true;
                        }
                    }
                    if (hasDiffAttrValue) {
                        break;
                    }
                }
            }
            if (hasDiffAttrValue || (kfs.length === 1 && kf0Marks.length > 1)) {
                return [true, mClassCount];
            } else {
                return [false, []]
            }
        } else {
            return [true, mClassCount];
        }
    }

    /**
     * 
     * @param targetKfg : root group
     * @param parentTrack 
     * @param startX 
     * @param kfSize 
     * @param acceptableCls 
     */
    public createBtn(targetKfg: KfGroup, firstKfArrInTargetKfg: IKeyframe[], parentTrack: KfTrack, startX: number, kfSize: ISize, acceptableCls: string[]) {
        //create a blank kfg
        this.fakeKfg = new KfGroup();
        this.fakeKfg.createBlankKfg(parentTrack, startX + KfGroup.PADDING);

        this.targetKfg = targetKfg;
        this.firstKfArrInTargetKfg = firstKfArrInTargetKfg;
        this.parentTrack = parentTrack;
        this.kfSize = kfSize;
        this.id = PlusBtn.BTN_IDX;
        PlusBtn.BTN_IDX++;
        this.acceptableCls = acceptableCls;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${PlusBtn.PADDING},${PlusBtn.PADDING + this.kfSize.h / 2 - PlusBtn.BTN_SIZE / 2})`);
        this.btnBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.btnBg.setAttributeNS(null, 'x', '0');
        this.btnBg.setAttributeNS(null, 'y', '0');
        this.btnBg.setAttributeNS(null, 'width', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'height', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'rx', `${PlusBtn.BTN_SIZE / 2}`);
        this.btnBg.setAttributeNS(null, 'fill', 'none');
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_COLOR}`);
        this.btnBg.setAttributeNS(null, 'stroke-dasharray', '4 3');
        this.container.appendChild(this.btnBg);
        this.btnIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.btnIcon.setAttributeNS(null, 'text-anchor', 'middle');
        this.btnIcon.setAttributeNS(null, 'x', `${PlusBtn.BTN_SIZE / 2}`);
        this.btnIcon.setAttributeNS(null, 'y', `${PlusBtn.BTN_SIZE / 2 + 7}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'font-size', '16pt');
        this.btnIcon.innerHTML = '+';
        this.container.appendChild(this.btnIcon);
        // this.parentTrack.container.appendChild(this.container);
        this.fakeKfg.container.appendChild(this.container);

        PlusBtn.allPlusBtn.push(this);
    }

    public removeBtn() {
        for (let i = 0, len = PlusBtn.allPlusBtn.length; i < len; i++) {
            if (PlusBtn.allPlusBtn[i].id === this.id) {
                PlusBtn.allPlusBtn.splice(i, 1);
                break;
            }
        }
        if (this.fakeKfg.container.contains(this.container)) {
            this.fakeKfg.container.removeChild(this.container);
        }
    }

    public highlightBtn() {
        this.isHighlighted = true;
        const oriTrans: ICoord = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform'));
        this.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x},${PlusBtn.PADDING + 2})`);
        this.btnBg.setAttributeNS(null, 'width', `${this.kfSize.w}`);
        this.btnBg.setAttributeNS(null, 'height', `${this.kfSize.h}`);
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'x', `${this.kfSize.w / 2}`);
        this.btnIcon.setAttributeNS(null, 'y', `${this.kfSize.h / 2 + 6}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
    }

    public cancelHighlightBtn() {
        this.isHighlighted = false;
        const oriTrans: ICoord = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform'));
        this.container.setAttributeNS(null, 'transform', `translate(${oriTrans.x},${PlusBtn.PADDING + this.kfSize.h / 2 - PlusBtn.BTN_SIZE / 2})`);
        this.btnBg.setAttributeNS(null, 'width', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'height', `${PlusBtn.BTN_SIZE}`);
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'x', `${PlusBtn.BTN_SIZE / 2}`);
        this.btnIcon.setAttributeNS(null, 'y', `${PlusBtn.BTN_SIZE / 2 + 6}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_COLOR}`);
    }

    public dragSelOver() {
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_DRAGOVER_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_DRAGOVER_COLOR}`);
        Tool.clearDragOver();
        PlusBtn.dragoverBtn = this;
    }

    public dragSelOut() {
        this.btnBg.setAttributeNS(null, 'stroke', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
        this.btnIcon.setAttributeNS(null, 'fill', `${PlusBtn.BTN_HIGHLIGHT_COLOR}`);
        PlusBtn.dragoverBtn = undefined;
    }

    public dropSelOn() {
        let selectedMarks: string[] = state.selection;
        let firstKfInfoInParent: IKeyframe = this.firstKfArrInTargetKfg[0];
        const tmpKfInfo: IKeyframe = KfItem.createKfInfo(selectedMarks,
            {
                duration: firstKfInfoInParent.duration,
                allCurrentMarks: firstKfInfoInParent.allCurrentMarks,
                allGroupMarks: firstKfInfoInParent.allGroupMarks
            });
        KfItem.allKfInfo.set(tmpKfInfo.id, tmpKfInfo);
        Reducer.triger(action.UPDATE_SELECTION, []);//reset state selection

        //create a kf and replace the plus btn
        const btnX: number = Tool.extractTransNums(this.container.getAttributeNS(null, 'transform')).x;
        this.removeBtn();
        let tmpKf: KfItem = new KfItem();
        tmpKf.createItem(tmpKfInfo, 1, this.fakeKfg, btnX);
        this.fakeKfg.children.unshift(tmpKf);
        this.fakeKfg.updateSize();

        //create suggestion list if there is one, judge whether to use current last kf as last kf or the current first as last kf
        const clsSelMarks: string[] = Util.extractClsFromMarks(selectedMarks);
        const clsFirstKf: string[] = Util.extractClsFromMarks(firstKfInfoInParent.marksThisKf);
        let suggestOnFirstKf: boolean = false;
        if (Tool.arrayContained(firstKfInfoInParent.marksThisKf, selectedMarks) && Tool.identicalArrays(clsSelMarks, clsFirstKf)) {//suggest based on first kf in animation
            suggestOnFirstKf = true;
            Suggest.suggestPaths(selectedMarks, firstKfInfoInParent.marksThisKf);
        } else {//suggest based on all marks in animation
            const marksThisAni: string[] = this.targetKfg.marksThisAni();
            Suggest.suggestPaths(selectedMarks, marksThisAni);
        }
        Reducer.triger(action.UPDATE_SUGGESTION_PATH, { ap: Suggest.allPaths, kfIdxInPath: -1, startKf: tmpKf, suggestOnFirstKf: suggestOnFirstKf, selectedMarks: selectedMarks });
    }
}
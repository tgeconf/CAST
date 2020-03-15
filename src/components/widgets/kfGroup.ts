import KfTrack from "./kfTrack";
import { IKeyframeGroup } from "../../app/ds";
import KfItem from "./kfItem";
import KfOmit from "./kfOmit";

// import '../../assets/style/kfGroup.scss'

export default class KfGroup {
    static groupIdx: number = 0;
    static leafLevel: number = 0;
    static BASIC_GRAY: number = 239;
    static GRAY_STEP: number = 20;
    static PADDING: number = 6;

    public newTrack: boolean;
    public posiX: number;
    public posiY: number;
    public width: number;
    public marks: string[];
    public treeLevel: number;
    public container: SVGGElement;
    public groupBg: SVGRectElement;
    public children: any[]
    public kfNum: number = 0;
    public kfOmit: KfOmit;
    // public leafLevel: number;

    public static reset() {
        this.groupIdx = 0;
        this.leafLevel = 0;
    }

    /**
     * @param g : container of this group, could be track or another group
     * @param p : init position of the root group
     */
    public createGroup(kfg: IKeyframeGroup, parentObj: KfGroup | KfTrack, posiY: number, treeLevel: number): void {
        if (parentObj.container) {
            // console.log('number group and kf: ', kfg.numGroup, kfg.numKf);
            this.newTrack = kfg.newTrack;
            this.treeLevel = treeLevel;
            this.posiY = posiY;
            this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            if (parentObj instanceof KfTrack) {
                this.container.setAttributeNS(null, 'transfrom', `translate(${parentObj.availableInsert}, ${this.posiY})`);
            }
            // this.parent = parentObj;
            this.drawGroupBg();
            this.container.appendChild(this.groupBg);
            parentObj.container.appendChild(this.container);
        }
    }

    /**
     * draw group container
     */
    public drawGroupBg() {
        this.groupBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.groupBg.setAttributeNS(null, 'stroke', '#898989');
        this.groupBg.setAttributeNS(null, 'stroke-width', '1');
        this.groupBg.setAttributeNS(null, 'rx', '8');
    }

    public updateGroupPosiAndSize(lastGroupStart: number, lastGroupWidth: number, rootGroup: boolean): void {
        if (this.children) {
            if (this.children[0] instanceof KfGroup) {//children are kfgroups
                this.children.forEach((c: KfGroup, i: number) => {
                    if (i === 0 || i === 1 || i === this.children.length - 1) {
                        if (i === 0) {
                            this.children[i].updateGroupPosiAndSize(KfGroup.PADDING, 0, false);
                        } else {
                            if (this.children.length > 3 && i === this.children.length - 1) {
                                this.children[i].updateGroupPosiAndSize(this.children[1].posiX, this.children[1].width + KfOmit.OMIT_W, false);
                            }
                            this.children[i].updateGroupPosiAndSize(this.children[i - 1].posiX, this.children[i - 1].width, false);
                        }
                    } else if (this.children.length > 3 && i === this.children.length - 2) {
                        // this.kfOmit = new KfOmit();
                        // this.kfOmit.createOmit()
                        this.kfOmit.updateNum(this.kfNum - 3);
                        this.kfOmit.updateStartX(this.children[1].posiX + this.children[1].width);
                    }
                })
            }
            //get size of all children (kfgroup or kfitem)
            let currentGroupWidth: number = this.children[this.children.length - 1].container.getBoundingClientRect().right - this.children[0].container.getBoundingClientRect().left;
            let childHeight: number = this.children[0].container.getBoundingClientRect().height;
            console.log('inner width: ', this.marks);
            // this.children.forEach((c: KfItem | KfGroup) => {
            //     console.log(c.container.getBoundingClientRect());
            //     currentGroupWidth += c.container.getBoundingClientRect().width;
            // })
            // if (this.children.length > 3) {
            //     currentGroupWidth += KfOmit.OMIT_W;
            // }
            // if (this.children[0] instanceof KfItem) {
            //     currentGroupWidth += (this.children.length - 1) * KfItem.PADDING;
            // }
            //TODO consider size of suggestion frame

            //update size
            currentGroupWidth += (2 * KfGroup.PADDING);
            this.groupBg.setAttributeNS(null, 'height', `${2 * KfGroup.PADDING + childHeight}`);
            this.groupBg.setAttributeNS(null, 'width', `${currentGroupWidth}`);
            //update background color
            const grayColor: number = KfGroup.BASIC_GRAY - KfGroup.GRAY_STEP * (KfGroup.leafLevel - this.treeLevel);
            this.groupBg.setAttributeNS(null, 'fill', `rgb(${grayColor}, ${grayColor}, ${grayColor})`);

            //update position
            const transPosiY = rootGroup ? this.posiY + 1 : this.posiY + KfGroup.PADDING;
            if (this.newTrack) {
                this.container.setAttributeNS(null, 'transform', `translate(${lastGroupStart}, ${transPosiY})`);
                this.posiX = currentGroupWidth > lastGroupWidth ? currentGroupWidth : lastGroupWidth;
            } else {
                this.container.setAttributeNS(null, 'transform', `translate(${lastGroupStart + lastGroupWidth}, ${transPosiY})`);
                this.posiX = lastGroupStart + lastGroupWidth;
                this.width = currentGroupWidth;
            }
        }
    }
}
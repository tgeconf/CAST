import KfTrack from "./kfTrack";
import { IKeyframeGroup } from "../../app/ds";
import KfOmit from "./kfOmit";
import KfTimingIllus from "./kfTimingIllus";
import KfItem from "./kfItem";
import Tool from "../../util/tool";
import { ICoord } from "../../util/ds";
import IntelliRefLine from "./intelliRefLine";

// import '../../assets/style/kfGroup.scss'

export default class KfGroup extends KfTimingIllus {
    static groupIdx: number = 0;
    static leafLevel: number = 0;
    static BASIC_GRAY: number = 239;
    static GRAY_STEP: number = 20;
    static PADDING: number = 6;
    static GROUP_RX: number = 8;

    public id: number;
    public aniId: string;
    public newTrack: boolean;
    public posiX: number;
    public posiY: number;
    public delay: number;
    public rendered: boolean = false;
    public kfHasOffset: boolean = false;//for updating omits
    public kfHasDuration: boolean = false;//for updating omits
    public width: number = 0;
    public marks: string[];
    public treeLevel: number;
    public container: SVGGElement;
    public groupBg: SVGRectElement;
    public children: any[] = [];
    public kfNum: number = 0;
    public kfOmits: KfOmit[] = [];
    public parentObj: KfGroup | KfTrack;

    public static reset() {
        this.groupIdx = 0;
        this.leafLevel = 0;
    }

    /**
     * @param g : container of this group, could be track or another group
     * @param p : init position of the root group
     */
    public createGroup(kfg: IKeyframeGroup, parentObj: KfGroup | KfTrack, posiY: number, treeLevel: number): void {
        this.id = kfg.id;
        this.aniId = kfg.aniId;
        this.newTrack = kfg.newTrack;
        this.treeLevel = treeLevel;
        this.posiY = posiY;
        this.hasOffset = kfg.delayIcon;
        this.parentObj = parentObj;
        this.delay = kfg.delay;

        if (typeof parentObj.container !== 'undefined') {
            this.rendered = true;
            this.renderGroup();
        }
    }

    public renderGroup() {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'id', `group${this.id}`);
        if (this.parentObj instanceof KfTrack) {
            this.posiY = 1;
            const transX: number = this.parentObj.availableInsert;
            this.container.setAttributeNS(null, 'transform', `translate(${transX}, ${this.posiY})`);
            this.parentObj.children.push(this);
        }
        if (this.hasOffset) {
            this.drawOffset(this.delay, 100, KfGroup.GROUP_RX);
            this.container.appendChild(this.offsetIllus);
        }
        this.drawGroupBg();
        this.container.appendChild(this.groupBg);
        this.parentObj.container.appendChild(this.container);
    }

    public updateParentKfHasTiming(hasOffset: boolean, hasDuration: boolean) {
        this.kfHasOffset = hasOffset;
        this.kfHasDuration = hasDuration;
        if (this.parentObj instanceof KfGroup) {
            if (this.parentObj.kfHasOffset !== hasOffset || this.parentObj.kfHasDuration !== hasDuration) {
                this.parentObj.updateParentKfHasTiming(hasOffset, hasDuration);
            }
        }
    }

    public drawGroupBg() {
        this.groupBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.groupBg.setAttributeNS(null, 'stroke', '#898989');
        this.groupBg.setAttributeNS(null, 'stroke-width', '1');
        this.groupBg.setAttributeNS(null, 'rx', `${KfGroup.GROUP_RX}`);
        this.groupBg.setAttributeNS(null, 'x', `${this.offsetWidth}`);
    }

    public translateGroup(kfItem: KfItem, transX: number, updateAlignedKfs: boolean = false): void {
        //translate kfitems after the input one within the same group
        const currentTransX: number = Tool.extractTransNums(kfItem.container.getAttributeNS(null, 'transform')).x;
        let count: number = 0;
        this.children.forEach((k: KfItem | KfOmit) => {
            const tmpTrans: ICoord = Tool.extractTransNums(k.container.getAttributeNS(null, 'transform'));
            if (tmpTrans.x >= currentTransX && !(count === 0 && k instanceof KfOmit)) {//translate this kf or omit
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

    public updateSize(): [number, number] {
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
        return [diffX, currentGroupWidth];
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
                                this.children[i].updateGroupPosiAndSize(this.children[1].posiX, this.children[1].width + KfOmit.OMIT_W + KfGroup.PADDING, true);
                            } else {
                                this.children[i].updateGroupPosiAndSize(this.children[i - 1].posiX, this.children[i - 1].width, false);
                            }
                        }
                    } else if (this.children.length > 3 && i === this.children.length - 2) {
                        this.kfOmits.forEach((kfO: KfOmit) => {
                            kfO.updateThumbnail(this.kfHasOffset, this.kfHasDuration);
                            kfO.updateNum(this.kfNum - 3);
                            kfO.updateTrans(this.children[1].posiX + this.children[1].width + KfGroup.PADDING, KfGroup.PADDING + this.children[1].container.getBoundingClientRect().height / 2);
                        })
                    }
                })
            }

            //update size
            const oriW: number = this.width;
            let [diffX, currentGroupWidth] = this.updateSize();
            if (this.parentObj instanceof KfTrack) {
                KfTrack.aniTrackMapping.get(this.aniId).forEach((kft: KfTrack) => {
                    kft.availableInsert += (currentGroupWidth - oriW);
                })
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
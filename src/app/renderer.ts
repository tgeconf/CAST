import { state, IState, State } from './state'
import { IDataItem, ISortDataAttr, IKeyframeGroup, IKeyframe, IKfGroupSize } from './ds'
import { ChartSpec, Animation } from 'canis_toolkit'
import { canisGenerator, canis } from './canisGenerator'
import { ViewToolBtn, ViewContent } from '../components/viewWindow'
import AttrBtn from '../components/widgets/attrBtn'
import AttrSort from '../components/widgets/attrSort'
import Util from './util'
import Reducer from './reducer'
import * as action from './action'
import SelectableTable from '../components/widgets/selectableTable'
import Lottie, { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie'
import { Player, player } from '../components/player'


/** for test!!!!!!!!!!!!!!!!!!!!!!!!! */
import testSpec from '../assets/tmp/testSpec.json'
import KfItem from '../components/widgets/kfItem'
import KfTrack from '../components/widgets/kfTrack'
import KfGroup from '../components/widgets/kfGroup'
import { KfContainer, kfContainer } from '../components/kfContainer'
import KfOmit from '../components/widgets/kfOmit'
/** end for test!!!!!!!!!!!!!!!!!!!!!!!!! */

/**
 * render html according to the state
 */
export default class Renderer {
    /**
     * generate the canis spec and render
     * @param s : state
     */
    public static async generateAndRenderSpec(s: IState) {
        canisGenerator.generate(s);
        console.log('generated canis spec: ', canisGenerator.canisSpec);
        const lottieSpec = await canis.renderSpec(canisGenerator.canisSpec, () => {
            Util.extractAttrValueAndDeterminType(ChartSpec.dataMarkDatum);
            //save histroy before update state
            State.tmpStateBusket.push([action.UPDATE_DATA_ORDER, state.dataOrder]);
            State.tmpStateBusket.push([action.UPDATE_DATA_TABLE, state.dataTable]);
            State.tmpStateBusket.push([action.UPDATE_DATA_SORT, state.sortDataAttrs]);
            Reducer.triger(action.UPDATE_DATA_ORDER, Array.from(Util.filteredDataTable.keys()));
            Reducer.triger(action.UPDATE_DATA_TABLE, Util.filteredDataTable);
            Reducer.triger(action.UPDATE_DATA_SORT, Object.keys(Util.attrType).map(attrName => {
                return {
                    attr: attrName,
                    sort: 'dataIndex'
                }
            }));
        });
        //add highlight box on the chart
        const svg: HTMLElement = document.getElementById('visChart');
        if (svg) {
            //create the highlight box
            const highlightBox: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            highlightBox.setAttributeNS(null, 'id', 'highlightSelectionFrame');
            highlightBox.setAttributeNS(null, 'class', 'highlight-selection-frame');
            highlightBox.setAttributeNS(null, 'fill', 'rgba(255, 255, 255, 0.01)');
            highlightBox.setAttributeNS(null, 'stroke', '#2196f3');
            highlightBox.setAttributeNS(null, 'stroke-width', '2');
            svg.appendChild(highlightBox);
            // Tool.resizeSVG(svg, svg.parentElement.offsetWidth, svg.parentElement.offsetHeight);
        }
        //render video view
        this.renderVideo(lottieSpec);
        player.resetPlayer({
            frameRate: canis.frameRate,
            currentTime: 0,
            totalTime: canis.duration()
        })
    }

    /**
     * test rendering spec
     * @param spec 
     */
    public static async renderSpec() {
        const lottieSpec = await canis.renderSpec(canisGenerator.canisSpec, () => { });
        //add highlight box on the chart
        const svg: HTMLElement = document.getElementById('visChart');
        if (svg) {
            //create the highlight box
            const highlightBox: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            highlightBox.setAttributeNS(null, 'id', 'highlightSelectionFrame');
            highlightBox.setAttributeNS(null, 'class', 'highlight-selection-frame');
            highlightBox.setAttributeNS(null, 'fill', 'rgba(255, 255, 255, 0.01)');
            highlightBox.setAttributeNS(null, 'stroke', '#2196f3');
            highlightBox.setAttributeNS(null, 'stroke-width', '2');
            svg.appendChild(highlightBox);
            // Tool.resizeSVG(svg, svg.parentElement.offsetWidth, svg.parentElement.offsetHeight);
        }
        //render video view
        this.renderVideo(lottieSpec);
        player.resetPlayer({
            frameRate: canis.frameRate,
            currentTime: 0,
            totalTime: canis.duration()
        })
    }

    public static renderVideo(lottieSpec: any): void {
        document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID).innerHTML = '';
        //save histroy before update state
        State.tmpStateBusket.push([action.UPDATE_LOTTIE, state.lottieAni]);
        State.saveHistory();
        Lottie.destroy();
        Reducer.triger(action.UPDATE_LOTTIE, Lottie.loadAnimation({
            container: document.getElementById(ViewContent.VIDEO_VIEW_CONTENT_ID),
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: lottieSpec // the animation data
        }));
        //start to play animation
        document.getElementById(Player.PLAY_BTN_ID).click();
        //render the hidden lottie for keyframes
        // console.log('rendering lottie spec: ', lottieSpec);
        // Reducer.triger(action.UPDATE_HIDDEN_LOTTIE, Lottie.loadAnimation({
        //     container: document.getElementById(ViewWindow.HIDDEN_LOTTIE_ID),
        //     renderer: 'svg',
        //     loop: false,
        //     autoplay: false,
        //     animationData: lottieSpec
        // }));
        //meanwhile render keyframes and timeline
        // Reducer.triger(action.UPDATE_KEYFRAME_TIME_POINTS, Animation.frameTime);
        Reducer.triger(action.UPDATE_KEYFRAME_TRACKS, Animation.animations);
        // Reducer.triger(action.UPDATE_GEOUPING_AND_TIMING, Animation.animations);
        console.log(Animation.animations);
    }

    public static renderKfContainerSliders(kfgSize: IKfGroupSize) {
        kfContainer.updateKfSlider(kfgSize);
    }

    public static renderKeyframeTracks(kfgs: IKeyframeGroup[]): void {
        //reset
        //TODO: need to check performance
        document.getElementById(KfContainer.KF_BG).innerHTML = '';
        document.getElementById(KfContainer.KF_FG).innerHTML = '';
        KfTrack.reset();
        KfGroup.reset();

        let groupTrackMapping: Map<string, KfTrack[]> = new Map();//key: aniId, value: track id array
        kfgs.forEach((kfg: IKeyframeGroup) => {
            console.log('kfg: ', kfg);
            KfGroup.leafLevel = 0;
            let treeLevel = 0;//use this to decide the background color of each group
            //top-down to init group and kf
            const rootGroup: KfGroup = this.renderKeyframeGroup(0, 1, kfg, groupTrackMapping, treeLevel);
            //bottom-up to update size and position
            rootGroup.updateGroupPosiAndSize(0, 0, true);
            const rootGroupBBox: DOMRect = rootGroup.container.getBoundingClientRect();
            Reducer.triger(action.UPDATE_KEYFRAME_CONTAINER_SLIDER, { width: rootGroupBBox.width, height: rootGroupBBox.height });
            // Reducer.triger(action.UPDATE_KEYFRAME_CONTAINER_SLIDER, rootGroupBBox.left + rootGroupBBox.width);
        })
    }

    public static renderKeyframeGroup(kfgIdx: number, totalKfgNum: number, kfg: IKeyframeGroup, groupTrackMapping: Map<string, KfTrack[]>, treeLevel: number, parentObj?: KfGroup): KfGroup {
        let targetTrack: KfTrack; //foreground of the track used to put the keyframe group
        if (kfg.newTrack) {
            console.log('creating ew track', kfg);
            targetTrack = new KfTrack();
            targetTrack.createTrack();
            if (typeof groupTrackMapping.get(kfg.aniId) === 'undefined') {
                groupTrackMapping.set(kfg.aniId, []);
            }
            groupTrackMapping.get(kfg.aniId).push(targetTrack);
        } else {
            console.log('using existing track', kfg);
            targetTrack = groupTrackMapping.get(kfg.aniId)[0];
        }
        console.log('track posi Y: ', targetTrack.trackPosiY);

        //draw group container
        let kfGroup: KfGroup = new KfGroup();
        kfGroup.children = [];
        console.log(parentObj ? 'has parentobj (group)' : 'dont have (track)');
        if (kfgIdx === 0 || kfgIdx === 1 || kfgIdx === totalKfgNum - 1) {
            kfGroup.createGroup(kfg, parentObj ? parentObj : targetTrack, targetTrack.trackPosiY, treeLevel);
        } else if (totalKfgNum > 3 && kfgIdx === totalKfgNum - 2) {
            let kfOmit: KfOmit = new KfOmit();
            kfOmit.createOmit(0, 0, parentObj, false, false);
            parentObj.kfOmit = kfOmit;
        }

        treeLevel++;
        if (treeLevel > KfGroup.leafLevel) {
            KfGroup.leafLevel = treeLevel;
        }
        if (kfg.keyframes.length > 0) {
            kfGroup.kfNum = kfg.keyframes.length;
            //rendering kf
            console.log('rendering kf');
            let kfPosiX = 0;
            kfg.keyframes.forEach((k: any, i: number) => {
                if (i === 0 || i === 1 || i === kfg.keyframes.length - 1) {
                    let kfItem: KfItem = new KfItem();
                    kfItem.createItem(k, treeLevel, kfGroup, kfPosiX);
                    kfGroup.children.push(kfItem);
                    kfPosiX += kfItem.totalWidth;
                } else if (kfg.keyframes.length > 3 && i === kfg.keyframes.length - 2) {//generate '...'
                    const omitNum: number = kfGroup.kfNum - 3;
                    if (omitNum > 0) {//omitted at least 1 kf
                        const kfOmit: KfOmit = new KfOmit();
                        kfOmit.createOmit(kfPosiX, omitNum, kfGroup, kfg.keyframes[0].delayIcon, kfg.keyframes[0].durationIcon, kfGroup.children[0].kfHeight / 2);
                        kfPosiX += KfOmit.OMIT_W;
                    }
                }
            })
        } else if (kfg.children.length > 0) {
            //rendering kf group
            console.log('rendering group');
            kfg.children.forEach((c: any, i: number) => {
                const tmpKfGroup: KfGroup = this.renderKeyframeGroup(i, kfg.children.length, c, groupTrackMapping, treeLevel, kfGroup);
                kfGroup.children.push(tmpKfGroup);
                kfGroup.kfNum += tmpKfGroup.kfNum;
            });
        }

        return kfGroup;
    }

    public static renderDataAttrs(sdaArr: ISortDataAttr[]): void {
        if (sdaArr.length > 0) {
            document.getElementById('attrBtnContainer').innerHTML = '';
            document.getElementById('sortInputContainer').innerHTML = '';
            sdaArr.forEach(sda => {
                const attrBtn: AttrBtn = new AttrBtn();
                attrBtn.createAttrBtn(sda.attr);
                document.getElementById('attrBtnContainer').appendChild(attrBtn.btn);
                const attrSort: AttrSort = new AttrSort();
                attrSort.createAttrSort(sda.attr);
                document.getElementById('sortInputContainer').appendChild(attrSort.selectInput);
            })
        }
    }

    public static renderDataTable(dt: Map<string, IDataItem>): void {
        if (dt.size > 0) {
            const dataTable: SelectableTable = new SelectableTable();
            document.getElementById('dataTabelContainer').innerHTML = '';
            document.getElementById('dataTabelContainer').appendChild(dataTable.createTable(dt));
            SelectableTable.renderSelection(state.selection);
        }
    }

    /**
     * render the suggestion checkbox status
     * @param suggesting 
     */
    public static renderSuggestionCheckbox(suggesting: boolean): void {
        (<HTMLInputElement>document.getElementById('suggestBox')).checked = suggesting;
    }

    /**
     * set the selection tool status
     * @param t 
     */
    public static renderChartTool(t: string): void {
        switch (t) {
            case ViewToolBtn.SINGLE:
                (<HTMLElement>document.getElementsByClassName('arrow-icon')[0]).click();
                break;
            case ViewToolBtn.LASSO:
                (<HTMLElement>document.getElementsByClassName('lasso-icon')[0]).click();
                break;
            case ViewToolBtn.DATA:
                (<HTMLElement>document.getElementsByClassName('table-icon')[0]).click();
                break;
        }
    }

    /**
     * set the style of the selected marks and the highlight box
     * @param selection 
     */
    public static renderSelectedMarks(selection: string[]): void {
        let highlightSelectionBox: HTMLElement = document.getElementById('highlightSelectionFrame');
        //highlight selection in data table
        SelectableTable.renderSelection(selection);
        if (selection.length === 0) {//no mark is selected
            if (highlightSelectionBox) {
                //reset highlightselectionbox
                highlightSelectionBox.setAttributeNS(null, 'x', '0');
                highlightSelectionBox.setAttributeNS(null, 'y', '0');
                highlightSelectionBox.setAttributeNS(null, 'width', '0');
                highlightSelectionBox.setAttributeNS(null, 'height', '0');
            }
            //reset all marks to un-selected
            Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => m.classList.remove('non-framed-mark'))
        } else {
            //find the boundary of the selected marks
            let minX = 10000, minY = 10000, maxX = -10000, maxY = -10000;
            Array.from(document.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
                const markId: string = m.id;
                if (selection.includes(markId)) {//this is a selected mark
                    m.classList.remove('non-framed-mark');
                    const tmpBBox = (<SVGGraphicsElement><unknown>m).getBBox();
                    minX = tmpBBox.x < minX ? tmpBBox.x : minX;
                    minY = tmpBBox.y < minY ? tmpBBox.y : minY;
                    maxX = tmpBBox.x + tmpBBox.width > maxX ? (tmpBBox.x + tmpBBox.width) : maxX;
                    maxY = tmpBBox.y + tmpBBox.height > maxY ? (tmpBBox.y + tmpBBox.height) : maxY;
                } else {//this is not a selected mark
                    m.classList.add('non-framed-mark');
                }
            })
            if (highlightSelectionBox) {
                //set the highlightSelectionFrame
                highlightSelectionBox.setAttributeNS(null, 'x', (minX - 5).toString());
                highlightSelectionBox.setAttributeNS(null, 'y', (minY - 5).toString());
                highlightSelectionBox.setAttributeNS(null, 'width', (maxX - minX + 10).toString());
                highlightSelectionBox.setAttributeNS(null, 'height', (maxY - minY + 10).toString());
            }
        }

    }
}
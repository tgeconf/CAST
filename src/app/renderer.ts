import { state, IState, State } from './state'
import { TDataItem, TSortDataAttr, TKeyframe } from './ds'
import { ChartSpec, Animation } from 'canis_toolkit'
import { canisGenerator, canis } from './canisGenerator'
import ViewWindow, { ViewToolBtn, ViewContent } from '../components/viewWindow'
import AttrBtn from '../components/widgets/attrBtn'
import AttrSort from '../components/widgets/attrSort'
import Util from './util'
import Tool from '../util/tool'
import Reducer from './reducer'
import * as action from './action'
import SelectableTable from '../components/widgets/selectableTable'
import Lottie, { AnimationItem } from '../../node_modules/lottie-web/build/player/lottie'
import { Player, player } from '../components/player'


/** for test!!!!!!!!!!!!!!!!!!!!!!!!! */
import testSpec from '../assets/tmp/testSpec.json'
import KeyframeItem from '../components/widgets/keyframeItem'
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
            Tool.resizeSVG(svg, svg.parentElement.offsetWidth, svg.parentElement.offsetHeight);
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
            Tool.resizeSVG(svg, svg.parentElement.offsetWidth, svg.parentElement.offsetHeight);
        }
        //render video view
        this.renderVideo(lottieSpec);
        player.resetPlayer({
            frameRate: canis.frameRate,
            currentTime: 0,
            totalTime: canis.duration()
        })
    }

    public static renderVideo(lottieSpec: any) {
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
        console.log('rendering lottie spec: ', lottieSpec);
        Reducer.triger(action.UPDATE_HIDDEN_LOTTIE, Lottie.loadAnimation({
            container: document.getElementById(ViewWindow.HIDDEN_LOTTIE_ID),
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: lottieSpec
        }));
        //meanwhile render keyframes
        Reducer.triger(action.UPDATE_KEYFRAME_TIME_POINTS, Animation.frameTime);
    }

    public static renderKeyframes(kfs: TKeyframe[], lottieAnimation: AnimationItem) {
        let kfListWidth: number = 0;
        console.log('rendering keyframes: ', kfs);
        const kfList: HTMLElement = document.getElementById(ViewWindow.KF_LIST_ID);
        //clear container
        kfList.innerHTML = '';
        kfs.forEach(kf => {
            lottieAnimation.goToAndStop(kf.timePoint);
            const hiddenSvg: HTMLElement = document.querySelector('#' + ViewWindow.HIDDEN_LOTTIE_ID + ' svg');
            const kfItem: KeyframeItem = new KeyframeItem();
            if (!kf.continued) {
                kfList.appendChild(kfItem.createEllipsis());
                kfListWidth += 22;
            }
            kfItem.createItem(hiddenSvg);
            kfList.appendChild(kfItem.keyframeContainer);
            kfListWidth += 250;
        })
        //reset the width of the kf-list
        kfList.style.width = kfListWidth + 'px';
    }

    public static renderDataAttrs(sdaArr: TSortDataAttr[]): void {
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

    public static renderDataTable(dt: Map<string, TDataItem>): void {
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
            Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => {
                m.classList.remove('non-framed-mark');
            })
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
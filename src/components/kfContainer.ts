import '../assets/style/keyframeContainer.scss'
import Tool from '../util/tool';
import { IKfGroupSize } from '../app/ds';

export class KfContainer {
    static KF_LIST_ID: string = 'kfList';
    static KF_BG: string = 'kfBgG';
    static KF_FG: string = 'kfFgG';
    static SLIDER_W: number = 10;
    static WHEEL_STEP: number = 20;

    public kfWidgetContainer: HTMLDivElement;
    public keyframeTrackContainer: SVGGElement;
    public xSliderContainer: SVGElement;
    public xSliderBg: SVGRectElement;
    public xSlider: SVGRectElement;
    public xSliderContainerW: number = 1000;
    public ySliderContainer: SVGElement;
    public ySliderBg: SVGRectElement;
    public ySlider: SVGRectElement;
    public ySliderContainerH: number = 200;

    public createKfContainer() {
        this.kfWidgetContainer = document.createElement('div');
        this.kfWidgetContainer.setAttribute('class', 'kf-widget-container');

        //create kf container
        const keyframeTrackSVG: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        keyframeTrackSVG.setAttributeNS(null, 'class', 'kf-tracks-container');
        this.keyframeTrackContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.keyframeTrackContainer.id = KfContainer.KF_LIST_ID;
        this.keyframeTrackContainer.setAttributeNS(null, 'class', 'kf-tracks-inner-container');
        const kfBgG: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        kfBgG.setAttributeNS(null, 'id', KfContainer.KF_BG);
        this.keyframeTrackContainer.appendChild(kfBgG);
        const kfFgG: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        kfFgG.setAttributeNS(null, 'id', KfContainer.KF_FG);
        this.keyframeTrackContainer.appendChild(kfFgG);
        keyframeTrackSVG.appendChild(this.keyframeTrackContainer);
        this.kfWidgetContainer.appendChild(keyframeTrackSVG);
        //create y slider
        this.createYSlider();
        //create x slider
        this.createXSlider();


        this.kfWidgetContainer.onmouseover = () => {
            this.updateKfSlider({});
            if (parseFloat(this.xSlider.getAttributeNS(null, 'width')) < parseFloat(this.xSliderBg.getAttributeNS(null, 'width'))) {
                this.xSliderContainer.setAttribute('style', `height:${KfContainer.SLIDER_W + 4}px; margin-top:${-KfContainer.SLIDER_W}px`);
            }
            if (parseFloat(this.ySlider.getAttributeNS(null, 'height')) < parseFloat(this.ySliderBg.getAttributeNS(null, 'height'))) {
                this.ySliderContainer.setAttribute('style', `width:${KfContainer.SLIDER_W + 4}px; margin-top:${-this.ySliderContainerH}px;`);
            }
        }
        this.kfWidgetContainer.onmouseout = () => {
            this.xSliderContainer.setAttribute('style', `height:${KfContainer.SLIDER_W + 4}px; margin-top:3px;`);
            this.ySliderContainer.setAttribute('style', `width:${KfContainer.SLIDER_W + 4}px; margin-top:${-this.ySliderContainerH}px; margin-right:${-KfContainer.SLIDER_W - 7}`)
        }
        this.kfWidgetContainer.onwheel = (wheelEvt) => {
            if (parseFloat(this.ySlider.getAttributeNS(null, 'height')) < parseFloat(this.ySliderBg.getAttributeNS(null, 'height'))) {
                let diffY: number = wheelEvt.deltaY < 0 ? -KfContainer.WHEEL_STEP : KfContainer.WHEEL_STEP;
                const currentSliderY: number = parseFloat(this.ySlider.getAttributeNS(null, 'y'));
                const currentSliderH: number = parseFloat(this.ySlider.getAttributeNS(null, 'height'));
                if (0 - currentSliderY > diffY && diffY < 0) {
                    diffY = 0 - currentSliderY;
                }
                if (this.ySliderContainerH - currentSliderY - currentSliderH < diffY && diffY > 0) {
                    diffY = this.ySliderContainerH - currentSliderY - currentSliderH;
                }
                if (currentSliderY + diffY >= 0 && currentSliderY + diffY + currentSliderH <= this.ySliderContainerH) {
                    this.ySlider.setAttributeNS(null, 'y', `${currentSliderY + diffY}`);

                    //update translate of keyframe
                    if (this.keyframeTrackContainer.getAttributeNS(null, 'transform')) {
                        let oriY: number = parseFloat(this.keyframeTrackContainer.getAttributeNS(null, 'transY'));
                        this.keyframeTrackContainer.setAttributeNS(null, 'transY', `${oriY - 2.5 * diffY}`)
                        this.keyframeTrackContainer.setAttributeNS(null, 'transform', `translate(0, ${oriY - 2.5 * diffY})`)
                    }
                }
            }
        }
    }

    public createYSlider() {
        this.ySliderContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.ySliderContainer.setAttributeNS(null, 'class', 'kf-y-slider-container');
        this.ySliderContainer.setAttribute('style', `width:${KfContainer.SLIDER_W + 4}px; margin-top:${-this.ySliderContainerH}px; margin-right:${-KfContainer.SLIDER_W - 7}`)
        this.ySliderBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.ySliderBg.setAttributeNS(null, 'x', '0');
        this.ySliderBg.setAttributeNS(null, 'y', '0');
        this.ySliderBg.setAttributeNS(null, 'width', `${KfContainer.SLIDER_W + 4}`);
        this.ySliderBg.setAttributeNS(null, 'height', '200');
        this.ySliderBg.setAttributeNS(null, 'fill', '#cdcdcd');
        this.ySliderContainer.appendChild(this.ySliderBg);
        this.ySlider = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.ySlider.setAttributeNS(null, 'class', 'kf-slider');
        this.ySlider.setAttributeNS(null, 'x', '0');
        this.ySlider.setAttributeNS(null, 'y', '0');
        this.ySlider.setAttributeNS(null, 'width', `${KfContainer.SLIDER_W + 4}`);
        this.ySlider.setAttributeNS(null, 'height', '10000');
        this.ySlider.setAttributeNS(null, 'rx', `${KfContainer.SLIDER_W / 2}`);
        this.ySlider.setAttributeNS(null, 'fill', '#f2f2f2');
        this.ySlider.onmousedown = (downEvt) => {
            let preY: number = downEvt.pageY;
            document.onmousemove = (moveEvt) => {
                const currentY: number = moveEvt.pageY;
                const diffY: number = currentY - preY;
                const currentSliderY: number = parseFloat(this.ySlider.getAttributeNS(null, 'y'));
                const currentSliderH: number = parseFloat(this.ySlider.getAttributeNS(null, 'height'));
                if (currentSliderY + diffY >= 0 && currentSliderY + diffY + currentSliderH <= this.ySliderContainerH) {
                    this.ySlider.setAttributeNS(null, 'y', `${currentSliderY + diffY}`);

                    //update translate of keyframe
                    if (this.keyframeTrackContainer.getAttributeNS(null, 'transform')) {
                        let oriY: number = parseFloat(this.keyframeTrackContainer.getAttributeNS(null, 'transY'));
                        this.keyframeTrackContainer.setAttributeNS(null, 'transY', `${oriY - 2.5 * diffY}`)
                        this.keyframeTrackContainer.setAttributeNS(null, 'transform', `translate(0, ${oriY - 2.5 * diffY})`)
                    }
                    preY = currentY;
                }
            }
            document.onmouseup = (upEvt) => {
                document.onmousemove = null;
                document.onmouseup = null;
            }
        }
        this.ySliderContainer.appendChild(this.ySlider);
        this.kfWidgetContainer.appendChild(this.ySliderContainer);
    }

    public createXSlider() {
        this.xSliderContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.xSliderContainer.setAttributeNS(null, 'class', 'kf-x-slider-container');
        this.xSliderContainer.setAttribute('style', `height:${KfContainer.SLIDER_W + 4}px; margin-top:3px;`)
        this.xSliderBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.xSliderBg.setAttributeNS(null, 'x', '0');
        this.xSliderBg.setAttributeNS(null, 'y', '0');
        this.xSliderBg.setAttributeNS(null, 'width', '10000');
        this.xSliderBg.setAttributeNS(null, 'height', `${KfContainer.SLIDER_W}`);
        this.xSliderBg.setAttributeNS(null, 'fill', '#cdcdcd');
        this.xSliderContainer.appendChild(this.xSliderBg);
        this.xSlider = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.xSlider.setAttributeNS(null, 'class', 'kf-slider');
        this.xSlider.setAttributeNS(null, 'x', '0');
        this.xSlider.setAttributeNS(null, 'y', '0');
        this.xSlider.setAttributeNS(null, 'width', '10100');
        this.xSlider.setAttributeNS(null, 'height', `${KfContainer.SLIDER_W}`);
        this.xSlider.setAttributeNS(null, 'rx', `${KfContainer.SLIDER_W / 2}`);
        this.xSlider.setAttributeNS(null, 'fill', '#f2f2f2');
        this.xSlider.onmousedown = (downEvt) => {
            let preX: number = downEvt.pageX;
            document.onmousemove = (moveEvt) => {
                const currentX: number = moveEvt.pageX;
                const diffX: number = currentX - preX;
                const currentSliderX: number = parseFloat(this.xSlider.getAttributeNS(null, 'x'));
                const currentSliderW: number = parseFloat(this.xSlider.getAttributeNS(null, 'width'));
                if (currentSliderX + diffX >= 0 && currentSliderX + diffX + currentSliderW <= this.xSliderContainerW) {
                    console.log(currentX, preX, diffX);
                    this.xSlider.setAttributeNS(null, 'x', `${currentSliderX + diffX}`);

                    //update viewBox of keyframe
                    if (this.keyframeTrackContainer.getAttributeNS(null, 'transform')) {
                        let oriX: number = parseFloat(this.keyframeTrackContainer.getAttributeNS(null, 'transX'));
                        console.log('orix: ', oriX, oriX - diffX);
                        this.keyframeTrackContainer.setAttributeNS(null, 'transX', `${oriX - 1.5 * diffX}`)
                        this.keyframeTrackContainer.setAttributeNS(null, 'transform', `translate(${oriX - 1.5 * diffX}, 0)`)
                    }
                    preX = currentX;
                }

            }
            document.onmouseup = (upEvt) => {
                document.onmousemove = null;
                document.onmouseup = null;
            }
        }
        this.xSliderContainer.appendChild(this.xSlider);
        this.kfWidgetContainer.appendChild(this.xSliderContainer);
    }

    public updateKfSlider(kfGroupSize: IKfGroupSize) {
        //update the viewBox
        if (!this.keyframeTrackContainer.getAttributeNS(null, 'transform')) {
            this.keyframeTrackContainer.setAttributeNS(null, 'transform', 'translate(0, 0)');
            this.keyframeTrackContainer.setAttributeNS(null, 'transX', '0');
            this.keyframeTrackContainer.setAttributeNS(null, 'transY', '0');
        }

        //update xslider and xslider track width
        this.xSliderContainerW = this.kfWidgetContainer.clientWidth;
        this.xSliderBg.setAttributeNS(null, 'width', `${this.xSliderContainerW}`);
        if (kfGroupSize.width) {
            this.xSlider.setAttributeNS(null, 'width', `${this.xSliderContainerW * this.xSliderContainerW / kfGroupSize.width}`);
        }

        //update yslider and yslider track height
        this.ySliderContainerH = this.kfWidgetContainer.clientHeight;
        this.ySliderContainer.setAttribute('style', `width:${KfContainer.SLIDER_W + 4}px; margin-top:${-this.ySliderContainerH}px; margin-right:${-KfContainer.SLIDER_W - 7}`)
        this.ySliderBg.setAttributeNS(null, 'height', `${this.ySliderContainerH}`);
        if (kfGroupSize.height) {
            this.ySlider.setAttributeNS(null, 'height', `${this.ySliderContainerH * this.ySliderContainerH / kfGroupSize.height}`);
        }
    }
}

export let kfContainer: KfContainer = new KfContainer();
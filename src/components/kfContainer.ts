import '../assets/style/keyframeContainer.scss'
import Tool from '../util/tool';

export class KfContainer {
    static KF_LIST_ID: string = 'kfList';
    static KF_BG: string = 'kfBgG';
    static KF_FG: string = 'kfFgG';
    static SLIDER_W: number = 10;

    public kfWidgetContainer: HTMLDivElement;
    public keyframeTrackContainer: SVGGElement;
    public xSliderContainer: SVGElement;
    public xSliderBg: SVGRectElement;
    public xSlider: SVGRectElement;
    public xSliderContainerW: number = 1000;
    public createKfContainer() {
        this.kfWidgetContainer = document.createElement('div');
        this.kfWidgetContainer.setAttribute('class', 'kf-widget-container');

        //create kf container
        const keyframeTrackSVG: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        keyframeTrackSVG.setAttributeNS(null, 'class', 'kf-tracks-container');
        this.keyframeTrackContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.keyframeTrackContainer.id = KfContainer.KF_LIST_ID;
        // this.keyframeTrackContainer.setAttributeNS(null, 'class', 'kf-tracks-container');
        const kfBgG: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        kfBgG.setAttributeNS(null, 'id', KfContainer.KF_BG);
        this.keyframeTrackContainer.appendChild(kfBgG);
        const kfFgG: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        kfFgG.setAttributeNS(null, 'id', KfContainer.KF_FG);
        this.keyframeTrackContainer.appendChild(kfFgG);
        keyframeTrackSVG.appendChild(this.keyframeTrackContainer);
        this.kfWidgetContainer.appendChild(keyframeTrackSVG);

        //create x slider
        this.xSliderContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.xSliderContainer.setAttributeNS(null, 'class', 'kf-x-slider-container');
        this.xSliderContainer.setAttribute('style', `height:${KfContainer.SLIDER_W + 4}px; margin-top:${-KfContainer.SLIDER_W - 4}px`)
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
        this.xSlider.setAttributeNS(null, 'width', '20');
        this.xSlider.setAttributeNS(null, 'height', `${KfContainer.SLIDER_W}`);
        this.xSlider.setAttributeNS(null, 'rx', `${KfContainer.SLIDER_W / 2}`);
        this.xSlider.setAttributeNS(null, 'fill', '#f2f2f2');
        this.xSlider.onmousedown = (downEvt) => {
            let preX: number = downEvt.pageX;
            // let preX: number = Tool.screenToSvgCoords(this.xSliderContainer, downEvt.pageX, 0).x;
            document.onmousemove = (moveEvt) => {
                // const currentX: number = Tool.screenToSvgCoords(this.xSliderContainer, moveEvt.pageX, 0).x;
                const currentX: number = moveEvt.pageX;
                const diffX: number = currentX - preX;
                const currentSliderX: number = parseFloat(this.xSlider.getAttributeNS(null, 'x'));
                const currentSliderW: number = parseFloat(this.xSlider.getAttributeNS(null, 'width'));
                if (currentSliderX + diffX >= 0 && currentSliderX + diffX + currentSliderW <= this.xSliderContainerW) {
                    console.log(currentX, preX, diffX);
                    this.xSlider.setAttributeNS(null, 'x', `${currentSliderX + diffX}`);

                    //update viewBox of keyframe
                    if (this.keyframeTrackContainer.getAttributeNS(null, 'transform')) {
                        // let viewBoxProps: string[] = this.keyframeTrackContainer.getAttributeNS(null, 'viewBox').split(' ');
                        // let oriX: number = parseFloat(viewBoxProps.shift());
                        // this.keyframeTrackContainer.setAttributeNS(null, 'viewBox', `${oriX + diffX + 8} ${viewBoxProps.join(' ')}`);
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

    public updateKfSlider(kfGroupWidth: number) {
        //update the viewBox
        if (!this.keyframeTrackContainer.getAttributeNS(null, 'transform')) {
            // this.keyframeTrackContainer.setAttributeNS(null, 'viewBox', `0 0 ${this.keyframeTrackContainer.getBoundingClientRect().width} ${this.keyframeTrackContainer.getBoundingClientRect().height}`);
            this.keyframeTrackContainer.setAttributeNS(null, 'transform', 'translate(0, 0)');
            this.keyframeTrackContainer.setAttributeNS(null, 'transX', '0');
        }

        //update slider and slider track width
        this.xSliderContainerW = this.kfWidgetContainer.clientWidth;
        this.xSliderBg.setAttributeNS(null, 'width', `${this.xSliderContainerW}`);
        this.xSlider.setAttributeNS(null, 'width', `${this.xSliderContainerW * this.xSliderContainerW / kfGroupWidth}`);
    }
}

export let kfContainer: KfContainer = new KfContainer();
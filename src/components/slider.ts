import '../assets/style/slider.scss'

export default class Slider {
    static SLIDER_LONG = 'sliderLong';
    static SLIDER_SHORT = 'sliderShort';
    static SLIDER_HEIGHT = 26;
    static SLIDER_LONG_WIDTH = 100;
    static SLIDER_SHORT_WIDTH = 40;
    static SLIDER_RADIUS = 5;
    static SLIDER_MARGIN = Slider.SLIDER_RADIUS + 2;

    domain: number[];//value this slider covers
    currentValue: number;

    //properties of the slider
    containerHeight: number;
    containerWidth: number;
    reverseScale: (a: number) => number;//return the data value which the slider currently encodes
    scale: (a: number) => number;//return position of the slider with the input data value

    //components in the slider
    slider: SVGCircleElement;
    trackPassed: SVGLineElement;

    constructor(type: string, domain: number[]) {
        this.domain = domain;
        this.containerHeight = Slider.SLIDER_HEIGHT;
        switch (type) {
            case Slider.SLIDER_LONG:
                this.containerWidth = Slider.SLIDER_LONG_WIDTH - 2 * Slider.SLIDER_MARGIN;
                break;
            case Slider.SLIDER_SHORT:
                this.containerWidth = Slider.SLIDER_SHORT_WIDTH - 2 * Slider.SLIDER_MARGIN;
                break;
            default:
                this.containerWidth = Slider.SLIDER_SHORT_WIDTH - 2 * Slider.SLIDER_MARGIN;
        }
        this.reverseScale = (a: number) => {
            return Math.floor(((a - Slider.SLIDER_MARGIN) / this.containerWidth) * (domain[1] - domain[0]) + domain[0]);
        }
        this.scale = (a: number) => {
            return Math.floor(this.containerWidth * (a - domain[0]) / (domain[1] - domain[0]) + Slider.SLIDER_MARGIN);
        }
    }

    public createSlider(): SVGSVGElement {
        const sliderContainer: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sliderContainer.setAttributeNS(null, 'class', 'slider-container');
        sliderContainer.setAttributeNS(null, 'width', (this.containerWidth + 2 * Slider.SLIDER_MARGIN).toString());
        sliderContainer.setAttributeNS(null, 'height', this.containerHeight.toString());
        //create track background
        const trackBg: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        trackBg.setAttributeNS(null, 'x1', Slider.SLIDER_MARGIN.toString());
        trackBg.setAttributeNS(null, 'y1', (this.containerHeight / 2).toString());
        trackBg.setAttributeNS(null, 'x2', (this.containerWidth + Slider.SLIDER_MARGIN).toString());
        trackBg.setAttributeNS(null, 'y2', (this.containerHeight / 2).toString());
        trackBg.setAttributeNS(null, 'stroke', '#c2c2c2');
        trackBg.setAttributeNS(null, 'stroke-width', '2');
        sliderContainer.appendChild(trackBg);

        //create track for the passed time
        this.trackPassed = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.trackPassed.setAttributeNS(null, 'class', 'track-passed');
        this.trackPassed.setAttributeNS(null, 'x1', Slider.SLIDER_MARGIN.toString());
        this.trackPassed.setAttributeNS(null, 'y1', (this.containerHeight / 2).toString());
        this.trackPassed.setAttributeNS(null, 'x2', (this.containerWidth / 2 + Slider.SLIDER_MARGIN).toString());
        this.trackPassed.setAttributeNS(null, 'y2', (this.containerHeight / 2).toString());
        this.trackPassed.setAttributeNS(null, 'stroke-width', '2');
        sliderContainer.appendChild(this.trackPassed);

        //create slider
        this.slider = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.slider.setAttributeNS(null, 'class', 'slider');
        this.slider.setAttributeNS(null, 'r', Slider.SLIDER_RADIUS.toString());
        this.slider.setAttributeNS(null, 'cx', (Slider.SLIDER_MARGIN + this.containerWidth / 2).toString());
        this.slider.setAttributeNS(null, 'cy', (this.containerHeight / 2).toString());

        //bind dragging event to the slider
        this.slider.onmousedown = (downEvt) => {
            let preX: number = downEvt.pageX;
            document.onmousemove = (moveEvt) => {
                const currentX: number = moveEvt.pageX;
                const diffX: number = currentX - preX;
                const currentSliderX: number = parseFloat(this.slider.getAttributeNS(null, 'cx'));
                if (currentSliderX + diffX <= this.containerWidth + Slider.SLIDER_MARGIN && currentSliderX + diffX >= Slider.SLIDER_MARGIN) {
                    this.slider.setAttributeNS(null, 'cx', (currentSliderX + diffX).toString());
                    this.trackPassed.setAttributeNS(null, 'x2', (currentSliderX + diffX).toString());
                    preX = currentX;
                }
            }
            document.onmouseup = () => {
                const currentSliderX: number = parseFloat(this.slider.getAttributeNS(null, 'cx'));
                this.currentValue = this.reverseScale(currentSliderX);
                document.onmousemove = null;
                document.onmouseup = null;
            }
        }
        sliderContainer.appendChild(this.slider);
        return sliderContainer;
    }

    public moveSlider(value: number): void {
        this.currentValue = value;
        this.slider.setAttributeNS(null, 'cx', this.scale(value).toString());
        this.trackPassed.setAttributeNS(null, 'x2', this.scale(value).toString());
    }
}
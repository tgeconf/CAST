import '../../assets/style/timeline.scss'

export default class Timeline {
    public static createTimeline(): HTMLDivElement {
        const timelineContainer: HTMLDivElement = document.createElement('div');
        timelineContainer.className = 'timeline-container';
        timelineContainer.appendChild(SvgTimeline.createSvgTimeline());
        return timelineContainer;
    }

    public static updateTimeline(scale: number) {
        SvgTimeline.updateSvgTimeline(scale);
    }
}

interface IUnitPros {
    msPerUnit: number,
    unitLen: number
}

class SvgTimeline {
    static totalTime = 2000;// by default 2000ms
    static totalLen = 2000;
    static stepLen = 2;// px number correspond to 1ms
    static maxUnitLen = 100;
    static svgTimeline: SVGSVGElement;
    public static createSvgTimeline(): SVGSVGElement {
        this.svgTimeline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgTimeline.setAttributeNS(null, 'class', 'svg-timeline-container');
        this.totalLen = this.stepLen * this.totalTime;
        this.updateSvgTimeline(0);
        return this.svgTimeline;
    }

    public static updateSvgTimeline(scale: number) {
        console.log('scale: ', scale);
        // this.stepLen *= scale;
        this.totalLen += scale*100;
        this.stepLen = this.totalLen / this.totalTime;
        this.svgTimeline.innerHTML = '';
        this.svgTimeline.setAttributeNS(null, 'width', this.totalLen + '');
        //calculate unit length
        const unit: IUnitPros = this.calUnitLen();
        this.addTicks(this.svgTimeline, unit);
    }
    public static calUnitLen(): IUnitPros {
        let msPerUnit = Math.floor(this.maxUnitLen / this.stepLen);
        if (msPerUnit % 5 !== 0) {
            msPerUnit -= msPerUnit % 5;
        }
        console.log('one unit has ' + msPerUnit + 'ms');
        msPerUnit = msPerUnit === 0 ? 5 : msPerUnit;
        return { msPerUnit: msPerUnit, unitLen: msPerUnit * this.stepLen };
    }

    public static addTicks(svgTimeline: SVGSVGElement, unit: IUnitPros): void {
        for (let i = 0; i * unit.unitLen < this.totalLen; i++) {
            const x: number = i * unit.unitLen;
            const tmpTick: SVGLineElement | SVGGElement = new Tick().createTick(x, i * unit.msPerUnit, i % 5 === 0);
            svgTimeline.appendChild(tmpTick);
        }
    }
}

class Tick {
    static y1: number = 0;
    static y2: number = 3;
    static y3: number = 6;
    static textY: number = Tick.y3 + 10;
    showLabel: boolean = false;
    createTick(x: number, ms: number, longTick: boolean = false): SVGLineElement | SVGGElement {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttributeNS(null, 'x1', x + '');
        tick.setAttributeNS(null, 'y1', Tick.y1 + '');
        tick.setAttributeNS(null, 'x2', x + '');
        tick.setAttributeNS(null, 'y2', longTick ? Tick.y3 + '' : Tick.y2 + '');
        tick.setAttributeNS(null, 'stroke', '#676767');
        if (longTick) {
            const g: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.appendChild(tick);
            const label: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.innerHTML = this.formatTime(ms);
            label.setAttributeNS(null, 'font-size', '12');
            label.setAttributeNS(null, 'fill', '#a5a5a5');
            label.setAttributeNS(null, 'x', x + '');
            label.setAttributeNS(null, 'y', Tick.textY + '');
            g.appendChild(label);
            return g;
        }
        return tick;
    }
    formatTime(time: number): string {
        const minute: number = Math.floor(time / 60000);
        const second: number = Math.floor((time - minute * 60000) / 1000);
        const ms: number = Math.floor((time - minute * 60000 - second * 1000) / 1);
        const minStr: string = minute < 10 ? '0' + minute : '' + minute;
        const secStr: string = second < 10 ? '0' + second : '' + second;
        const msStr = ms < 100 ? (ms < 10 ? '00' + ms : '0' + ms) : '' + ms;
        return minStr + ':' + secStr + '.' + msStr;
    }
}
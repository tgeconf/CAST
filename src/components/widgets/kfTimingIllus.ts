export default class KfTimingIllus {
    static BASIC_OFFSET_DURATION_W: number = 26;
    static OFFSET_COLOR: string = '#ef7b2acc';
    static DURATION_COLOR: string = '#5e9bd4cc';
    static minDuration: number = 10000;
    static maxDuration: number = 0;
    static minOffset: number = 10000;
    static maxOffset: number = 0;

    public hasOffset: boolean = false;
    public offsetIllus: SVGGElement
    public offsetBg: SVGRectElement
    public offsetWidth: number = 0
    public offsetIcon: SVGGElement

    public hasDuration: boolean = false;
    public durationIllus: SVGGElement
    public durationBg: SVGRectElement
    public durationIcon: SVGGElement
    public durationWidth: number = 0

    public static resetOffsetDuration(): void {
        this.minOffset = 100000;
        this.maxOffset = 0;
        this.minDuration = 100000;
        this.maxDuration = 0;
    }

    public static updateOffsetRange(offset: number): void {
        if (offset > 0) {
            if (offset < this.minOffset) {
                this.minOffset = offset;
            }
            if (offset > this.maxOffset) {
                this.maxOffset = offset;
            }
            this.unitRange();
        }
    }

    public static updateDurationRange(duration: number): void {
        if (duration > 0) {
            if (duration < this.minDuration) {
                this.minDuration = duration;
            }
            if (duration > this.maxDuration) {
                this.maxDuration = duration;
            }
            this.unitRange();
        }
    }

    public static unitRange() {
        if (this.minDuration < this.minOffset) {
            this.minOffset = this.minDuration;
        } else {
            this.minDuration = this.minOffset;
        }

        if (this.maxOffset > this.maxDuration) {
            this.maxDuration = this.maxOffset;
        } else {
            this.maxOffset = this.maxDuration;
        }
    }

    public drawOffset(offset: number, widgetHeight: number, groupRx: number = 0): void {
        this.offsetWidth = KfTimingIllus.BASIC_OFFSET_DURATION_W * offset / KfTimingIllus.minOffset;
        this.offsetIllus = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.offsetBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.offsetBg.setAttributeNS(null, 'x', '0');
        this.offsetBg.setAttributeNS(null, 'y', '0');
        this.offsetBg.setAttributeNS(null, 'width', `${this.offsetWidth + groupRx}`);
        this.offsetBg.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.offsetBg.setAttributeNS(null, 'fill', KfTimingIllus.OFFSET_COLOR);
        this.offsetIllus.appendChild(this.offsetBg);
        this.offsetIcon = this.drawArrowIcon(this.offsetWidth / 2 - 6, widgetHeight / 2 - 6);
        this.offsetIllus.appendChild(this.offsetIcon);
    }

    public updateOffset(widgetHeight: number): void {
        this.offsetBg.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.offsetIcon.setAttributeNS(null, 'transform', `translate(${this.offsetWidth / 2 - 6}, ${widgetHeight / 2 - 6})`)
    }

    public drawDuration(duration: number, widgetX: number, widgetHeight: number): void {
        this.durationWidth = KfTimingIllus.BASIC_OFFSET_DURATION_W * duration / KfTimingIllus.minDuration;
        this.durationIllus = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const transX: number = typeof this.offsetIllus === 'undefined' ? widgetX : widgetX + this.offsetWidth;
        this.durationIllus.setAttributeNS(null, 'transform', `translate(${transX}, 0)`);
        this.durationBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.durationBg.setAttributeNS(null, 'x', '0');
        this.durationBg.setAttributeNS(null, 'y', '0');
        this.durationBg.setAttributeNS(null, 'fill', KfTimingIllus.DURATION_COLOR);
        this.durationBg.setAttributeNS(null, 'width', `${this.durationWidth}`);
        this.durationBg.setAttributeNS(null, 'height', `${widgetHeight}`);
        this.durationIllus.appendChild(this.durationBg);
        this.durationIcon = this.drawArrowIcon(this.durationWidth / 2 - 6, widgetHeight / 2 - 6);
        this.durationIllus.appendChild(this.durationIcon);
    }

    public drawArrowIcon(transX: number, transY: number): SVGGElement {
        const icon: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        icon.setAttributeNS(null, 'transform', `translate(${transX}, ${transY})`);
        const iconPolygon: SVGPolygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        iconPolygon.setAttributeNS(null, 'fill', '#fff');
        iconPolygon.setAttributeNS(null, 'points', '10.1,0 10.1,4.1 5.6,0.1 4.3,1.5 8.3,5.1 0,5.1 0,6.9 8.3,6.9 4.3,10.5 5.6,11.9 10.1,7.9 10.1,12 12,12 12,0 ');
        icon.appendChild(iconPolygon);
        return icon;
    }
}
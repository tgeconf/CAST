import KfGroup from "./kfGroup";

export default class KfOmit {
    static OMIT_W: number = 30;
    public container: SVGGElement;
    public num: SVGTextElement;
    public createOmit(startX: number, omittedKfNum: number, parentObj: KfGroup): void {
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfGroup.PADDING}, 0)`);
        //create thumbnail
        //create number
        this.num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.num.setAttributeNS(null, 'x', `${KfOmit.OMIT_W / 2}`);
        this.num.setAttributeNS(null, 'y', '130');
        this.num.setAttributeNS(null, 'text-anchor', 'middle');
        this.num.innerHTML = `${omittedKfNum}`;
        this.container.appendChild(this.num);

        //create ...
        const dots: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dots.setAttributeNS(null, 'x', `${KfOmit.OMIT_W / 2}`);
        dots.setAttributeNS(null, 'y', '150');
        dots.setAttributeNS(null, 'text-anchor', 'middle');
        dots.innerHTML = '...';
        this.container.appendChild(dots);
        parentObj.container.appendChild(this.container);
    }

    public updateStartX(startX: number): void {
        this.container.setAttributeNS(null, 'transform', `translate(${startX + KfGroup.PADDING}, 0)`);
    }

    public updateNum(omittedKfNum: number): void {
        this.num.innerHTML = `${omittedKfNum}`;
    }
}
import { IBoundary } from './ds'

export default class Rectangular {
    svg: HTMLElement;
    /**
     * create the dashed selection frame when mouse down
     * @param svg 
     */
    public createSelectionFrame(svg: HTMLElement) {
        this.svg = svg;
        const selectionFrame: SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        selectionFrame.setAttributeNS(null, 'id', 'rectSelectFrame');
        selectionFrame.setAttributeNS(null, 'fill', 'rgba(255, 255, 255, 0)');
        selectionFrame.setAttributeNS(null, 'stroke', '#505050');
        selectionFrame.setAttributeNS(null, 'stroke-dasharray', '2,2');
        svg.appendChild(selectionFrame);
    }
    /**
     * update the dashed selection frame when mouse move
     */
    public updateSelectionFrame(boundary: IBoundary) {
        const selectionFrame: SVGRectElement = <SVGRectElement><unknown>document.getElementById('rectSelectFrame');
        selectionFrame.setAttributeNS(null, 'x', boundary.x1.toString());
        selectionFrame.setAttributeNS(null, 'y', boundary.y1.toString());
        selectionFrame.setAttributeNS(null, 'width', Math.abs(boundary.x2 - boundary.x1).toString());
        selectionFrame.setAttributeNS(null, 'height', Math.abs(boundary.y2 - boundary.y1).toString());
    }

    /**
     * remove the dashed selection frame when mouse up
     */
    public removeSelectionFrame() {
        if (document.getElementById('rectSelectFrame')) {
            document.getElementById('rectSelectFrame').remove();
        }
    }

    /**
     * 
     * @param boundary 
     * @param framedMarks 
     * @param svgId 
     */
    public rectangularSelect(boundary: IBoundary, framedMarks: string[]): string[] {
        let result: string[] = [];
        //filter marks
        Array.from(document.getElementsByClassName('mark')).forEach((m: HTMLElement) => {
            const markBBox = m.getBoundingClientRect();
            const coord1X = markBBox.left - this.svg.getBoundingClientRect().x,
                coord1Y = markBBox.top - this.svg.getBoundingClientRect().y,
                coord2X = coord1X + markBBox.width,
                coord2Y = coord1Y + markBBox.height;
            const framed: boolean = this.pointInRect(boundary, { x1: coord1X, y1: coord1Y, x2: coord2X, y2: coord2Y });
            //update the appearance of marks
            if ((framedMarks.includes(m.id) && framed) || (!framedMarks.includes(m.id) && !framed)) {
                m.classList.add('non-framed-mark');
            } else if ((framedMarks.includes(m.id) && !framed) || (!framedMarks.includes(m.id) && framed)) {
                m.classList.remove('non-framed-mark');
                result.push(m.id);
            }
        })

        return result;
    }
    public pointInRect(boundary: IBoundary, markBoundary: IBoundary): boolean {
        const [minX, maxX] = boundary.x1 < boundary.x2 ? [boundary.x1, boundary.x2] : [boundary.x2, boundary.x1];
        const [minY, maxY] = boundary.y1 < boundary.y2 ? [boundary.y1, boundary.y2] : [boundary.y2, boundary.y1];
        let framed = false;
        if (markBoundary.x1 >= minX && markBoundary.x2 <= maxX && markBoundary.y1 >= minY && markBoundary.y2 <= maxY) {
            framed = true;
        }
        return framed;
    }

}
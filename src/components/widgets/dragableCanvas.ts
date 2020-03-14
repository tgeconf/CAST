import '../../assets/style/dragableCanvas.scss'
import { ICoord } from '../../util/ds';

export default class DragableCanvas {
    /**
     * create a canvas when grabing the selected marks from the chart
     * @param targetSVG : svg chart being selected
     * @param targetArea : selected area in the chart
     * @param downCoord : mouse down position
     */
    public createCanvas(targetSVG: HTMLElement, targetArea: DOMRect, downCoord: ICoord) {
        targetSVG.classList.toggle('chart-when-dragging');
        Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => m.style.display = 'none');
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.className = 'drag-drop-canvas grab-selection';
        canvas.id = 'dragDropCanvas';
        const ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);

        const svgX = targetSVG.getBoundingClientRect().left, svgY = targetSVG.getBoundingClientRect().top;
        canvas.width = targetArea.width - 2;
        canvas.height = targetArea.height - 2;
        canvas.style.left = targetArea.left + 'px';
        canvas.style.top = targetArea.top + 'px';
        let img = new Image();
        img.onload = () => ctx.drawImage(img, -targetArea.left + svgX - 1, -targetArea.top + svgY - 1);
        img.src = 'data:image/svg+xml;base64,' + btoa((new XMLSerializer()).serializeToString(targetSVG));
        Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => m.style.display = 'block');
        const diffX = downCoord.x - targetArea.left, diffY = downCoord.y - targetArea.top;
        document.onmousemove = (moveEvt) => {
            canvas.style.left = `${moveEvt.pageX - diffX}px`;
            canvas.style.top = `${moveEvt.pageY - diffY}px`;

            //highlight kfs which can be dropped on
            
        }
        document.onmouseup = (upEvt) => {
            canvas.remove();
            targetSVG.classList.toggle('chart-when-dragging');
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

export const dragableCanvas = new DragableCanvas();
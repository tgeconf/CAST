import '../../assets/style/dragableCanvas.scss'
import { ICoord } from '../../util/ds';
import KfItem from './kfItem';

export default class DragableCanvas {
    /**
     * create a canvas when grabing the selected marks from the chart
     * @param targetSVG : svg chart being selected
     * @param targetArea : selected area in the chart
     * @param downCoord : mouse down position
     */
    public createCanvas(targetSVG: HTMLElement, targetArea: DOMRect, downCoord: ICoord) {
        targetSVG.classList.toggle('chart-when-dragging');
        document.getElementById('highlightSelectionFrame').style.display = 'none';
        Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => m.style.display = 'none');
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.className = 'drag-drop-canvas grab-selection';
        canvas.id = 'dragDropCanvas';
        const ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);

        const svgW: number = targetSVG.getBoundingClientRect().width, svgH: number = targetSVG.getBoundingClientRect().height;
        canvas.width = KfItem.KF_WIDTH;
        canvas.height = KfItem.KF_HEIGHT;
        canvas.style.left = `${downCoord.x - canvas.width / 2}px`;
        canvas.style.top = `${downCoord.y - canvas.height / 2}px`;
        let img = new Image();
        img.onload = () => {
            //shrink the svg size to the same size as kf
            let dx: number = 0, dy: number = 0, scaleWidth: number = canvas.width, scaleHeight: number = canvas.width * (svgH / svgW);
            if (scaleHeight <= canvas.height) {
                dy = (canvas.height - scaleHeight) / 2;
            } else {
                scaleHeight = canvas.height;
                scaleWidth = canvas.height * (svgW / svgH);
                dx = (canvas.width - scaleWidth) / 2;
            }
            ctx.drawImage(img, dx, dy, scaleWidth, scaleHeight);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa((new XMLSerializer()).serializeToString(targetSVG));

        document.getElementById('highlightSelectionFrame').style.display = 'block';
        Array.from(document.getElementsByClassName('non-framed-mark')).forEach((m: HTMLElement) => m.style.display = 'block');
        document.onmousemove = (moveEvt) => {
            canvas.style.left = `${moveEvt.pageX - canvas.width / 2}px`;
            canvas.style.top = `${moveEvt.pageY - canvas.height / 2}px`;

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
import '../../assets/style/dragableCanvas.scss'

export default class DragableCanvas{
    public createCanvas(){
        const canvas:HTMLCanvasElement = document.createElement('canvas');
        canvas.className = 'drag-drop-canvas grab-selection';
        canvas.id = 'dragDropCanvas';
    }
}
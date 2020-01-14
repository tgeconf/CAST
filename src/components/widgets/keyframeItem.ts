import '../../assets/style/keyframeItem.scss'

export default class KeyframeItem {
    public isContinued: boolean
    public highlightMarks: string[]

    public createItem(): HTMLDivElement {
        const keyframeContainer: HTMLDivElement = document.createElement('div');
        keyframeContainer.className = 'keyframe-item-container';
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        keyframeContainer.appendChild(canvas);
        return keyframeContainer;
    }
}
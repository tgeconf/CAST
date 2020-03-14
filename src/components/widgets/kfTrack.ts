import ViewWindow from "../viewWindow";

// import '../../assets/style/kfTrack.scss'

export default class KfTrack {
    static TRACK_HEIGHT: number = 180;
    static trackIdx: number = 0;

    public trackId: string;
    public trackBgContainer: SVGGElement;
    public trackPosiY: number;
    public container: SVGGElement;
    public trackBg: SVGRectElement;
    public splitLine: SVGLineElement;
    public availableInsert: number = 0;

    public static reset() {
        this.trackIdx = 0;
    }

    public createTrack(): void {
        //TODO: consider insert new tracks
        const numExistTracks: number = document.getElementsByClassName('kf-track').length;
        this.trackPosiY = numExistTracks * KfTrack.TRACK_HEIGHT;
        this.trackBgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.trackBgContainer.setAttributeNS(null, 'transform', `translate(0, ${this.trackPosiY})`);
        this.trackBgContainer.setAttributeNS(null, 'id', `trackBg${KfTrack.trackIdx}`);
        document.getElementById(ViewWindow.KF_BG).appendChild(this.trackBgContainer);

        this.trackId = `trackFg${KfTrack.trackIdx}`;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(0, ${numExistTracks * KfTrack.TRACK_HEIGHT})`);
        this.container.setAttributeNS(null, 'id', this.trackId);
        document.getElementById(ViewWindow.KF_FG).appendChild(this.container);

        KfTrack.trackIdx++;

        //draw track bg
        this.trackBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.trackBg.setAttributeNS(null, 'x', '0');
        this.trackBg.setAttributeNS(null, 'y', '0');
        this.trackBg.setAttributeNS(null, 'width', '2000');
        this.trackBg.setAttributeNS(null, 'height', `${KfTrack.TRACK_HEIGHT}`);
        this.trackBg.setAttributeNS(null, 'fill', '#efefef');
        this.trackBgContainer.appendChild(this.trackBg);

        //draw split line
        this.splitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.splitLine.setAttributeNS(null, 'x1', '0');
        this.splitLine.setAttributeNS(null, 'x2', '2000');
        this.splitLine.setAttributeNS(null, 'y1', `${KfTrack.TRACK_HEIGHT}`);
        this.splitLine.setAttributeNS(null, 'y2', `${KfTrack.TRACK_HEIGHT}`);
        this.splitLine.setAttributeNS(null, 'stroke', '#c9c9c9');
        this.trackBgContainer.appendChild(this.splitLine);
    }

    public hightLightTrack() {
        this.trackBg.setAttributeNS(null, 'fill', 'blue');
        this.splitLine.setAttributeNS(null, 'stroke', 'blue');
    }
}
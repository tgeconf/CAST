import { KfContainer } from "../kfContainer";
import KfGroup from "./kfGroup";
import KfItem from "./kfItem";

export default class KfTrack {
    static TRACK_HEIGHT: number = 180;
    static trackIdx: number = 0;
    static allTracks: KfTrack[] = [];
    static aniTrackMapping: Map<string, KfTrack[]> = new Map();//key: aniId, value: tracks this animation possesses

    public trackId: string;
    public trackBgContainer: SVGGElement;
    public trackPosiY: number;
    public container: SVGGElement;
    public trackBg: SVGRectElement;
    public splitLine: SVGLineElement;
    public availableInsert: number = KfItem.KF_WIDTH + 2 * KfItem.PADDING;
    public children: KfGroup[] = [];

    public static reset() {
        this.trackIdx = 0;
        this.allTracks = [];
        this.aniTrackMapping.clear();
    }

    public createTrack(): void {
        //TODO: consider insert new tracks
        const numExistTracks: number = document.getElementsByClassName('kf-track').length;
        this.trackPosiY = numExistTracks * KfTrack.TRACK_HEIGHT;
        this.trackBgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.trackBgContainer.setAttributeNS(null, 'transform', `translate(0, ${this.trackPosiY})`);
        this.trackBgContainer.setAttributeNS(null, 'id', `trackBg${KfTrack.trackIdx}`);
        document.getElementById(KfContainer.KF_BG).appendChild(this.trackBgContainer);

        this.trackId = `trackFg${KfTrack.trackIdx}`;
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.setAttributeNS(null, 'transform', `translate(0, ${numExistTracks * KfTrack.TRACK_HEIGHT})`);
        this.container.setAttributeNS(null, 'id', this.trackId);
        this.container.setAttributeNS(null, 'class', 'kf-track');
        document.getElementById(KfContainer.KF_FG).appendChild(this.container);

        KfTrack.trackIdx++;

        //draw track bg
        this.trackBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.trackBg.setAttributeNS(null, 'x', '0');
        this.trackBg.setAttributeNS(null, 'y', '0');
        this.trackBg.setAttributeNS(null, 'width', '20000');
        this.trackBg.setAttributeNS(null, 'height', `${KfTrack.TRACK_HEIGHT}`);
        this.trackBg.setAttributeNS(null, 'fill', '#efefef');
        this.trackBgContainer.appendChild(this.trackBg);

        //draw split line
        this.splitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.splitLine.setAttributeNS(null, 'x1', '0');
        this.splitLine.setAttributeNS(null, 'x2', '20000');
        this.splitLine.setAttributeNS(null, 'y1', `${KfTrack.TRACK_HEIGHT}`);
        this.splitLine.setAttributeNS(null, 'y2', `${KfTrack.TRACK_HEIGHT}`);
        this.splitLine.setAttributeNS(null, 'stroke', '#c9c9c9');
        this.trackBgContainer.appendChild(this.splitLine);

        KfTrack.allTracks.push(this);
    }

    public hightLightTrack() {
        this.trackBg.setAttributeNS(null, 'fill', 'blue');
        this.splitLine.setAttributeNS(null, 'stroke', 'blue');
    }
}
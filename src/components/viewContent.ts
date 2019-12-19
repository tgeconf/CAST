import '../assets/style/view-content.scss'
import Timeline from './timeline'

export class ChartViewContent {
    public static createChartViewContent() {
        const viewContent: HTMLDivElement = document.createElement('div');
        viewContent.id = 'chartViewContent';
        viewContent.className = 'chart-view-content';
        return viewContent;
    }
}

export class VideoViewContent {
    public static createVideoViewContent() {
        const viewContent: HTMLDivElement = document.createElement('div');
        viewContent.className = 'video-view-content';
        return viewContent;
    }
}

export class KFViewContent {
    static scale = 1;
    public static createKeyframeViewContent() {
        const viewContent: HTMLDivElement = document.createElement('div');
        viewContent.className = 'kf-view-content';

        //create kf title section and track section
        const kfTitleSec: HTMLDivElement = document.createElement('div');
        kfTitleSec.className = 'kf-title';
        viewContent.appendChild(Timeline.createTimeline());
        viewContent.onwheel = (e) => this.zoomTimeline(e);
        return viewContent;
    }

    public static zoomTimeline(e: MouseWheelEvent) {
        e.preventDefault();
        this.scale = e.deltaY * -0.01;
        // this.scale = Math.min(Math.max(.125, this.scale), 4);
        Timeline.updateTimeline(this.scale);
    }
}
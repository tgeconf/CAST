import '../assets/style/view-content.scss'
import Timeline from './timeline'
import ViewWindow from './viewWindow'

export default class ViewContent {
    static CHART_VIEW_CONTENT_ID: string = 'chartContainer';
    static CHART_VIEW_CONTENT_CLS: string = 'chart-view-content';
    static VIDEO_VIEW_CONTENT_ID: string = 'videoContainer';
    static VIDEO_VIEW_CONTENT_CLS: string = 'video-view-content';
    static KF_VIEW_CONTENT_ID: string = 'kfContainer';
    static KF_VIEW_CONTENT_CLS: string = 'kf-view-content';

    container: HTMLDivElement;

    public createViewContent(contentType: string) {
        switch (contentType) {
            case ViewWindow.CHART_VIEW_TITLE:
                this.createChartViewContent();
                break;
            case ViewWindow.VIDEO_VIEW_TITLE:
                this.createVideoViewContent();
                break;
            case ViewWindow.KF_VIEW_TITLE:
                this.createKeyframeViewContent();
                break;
        }
    }

    public createChartViewContent(): void {
        this.container = document.createElement('div');
        this.container.id = ViewContent.CHART_VIEW_CONTENT_ID;
        this.container.className = ViewContent.CHART_VIEW_CONTENT_CLS;
    }

    public createVideoViewContent(): void {
        this.container = document.createElement('div');
        this.container.id = ViewContent.VIDEO_VIEW_CONTENT_ID;
        this.container.className = ViewContent.VIDEO_VIEW_CONTENT_CLS;
    }

    public createKeyframeViewContent(): void {
        this.container = document.createElement('div');
        this.container.id = ViewContent.KF_VIEW_CONTENT_ID;
        this.container.className = ViewContent.KF_VIEW_CONTENT_CLS;

        //create kf title section and track section
        const kfTitleSec: HTMLDivElement = document.createElement('div');
        kfTitleSec.className = 'kf-title';
        // this.container.appendChild(Timeline.createTimeline());
        // this.container.onwheel = (e) => this.zoomTimeline(e);
    }
}

// export class ChartViewContent {
//     public static createChartViewContent() {
//         const viewContent: HTMLDivElement = document.createElement('div');
//         viewContent.id = 'chartViewContent';
//         viewContent.className = 'chart-view-content';
//         return viewContent;
//     }
// }

// export class VideoViewContent {
//     public static createVideoViewContent() {
//         const viewContent: HTMLDivElement = document.createElement('div');
//         viewContent.className = 'video-view-content';
//         return viewContent;
//     }
// }

// export class KFViewContent {
//     static scale = 1;
//     public static createKeyframeViewContent() {
//         const viewContent: HTMLDivElement = document.createElement('div');
//         viewContent.className = 'kf-view-content';

//         //create kf title section and track section
//         const kfTitleSec: HTMLDivElement = document.createElement('div');
//         kfTitleSec.className = 'kf-title';
//         // viewContent.appendChild(Timeline.createTimeline());
//         // viewContent.onwheel = (e) => this.zoomTimeline(e);
//         return viewContent;
//     }

//     public static zoomTimeline(e: MouseWheelEvent) {
//         e.preventDefault();
//         this.scale = e.deltaY * -0.01;
//         // this.scale = Math.min(Math.max(.125, this.scale), 4);
//         Timeline.updateTimeline(this.scale);
//     }
// }
import '../assets/style/view-content.scss'

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
    public static createKeyframeViewContent() {
        const viewContent: HTMLDivElement = document.createElement('div');
        viewContent.className = 'view-content';
        return viewContent;
    }
}
import '../assets/style/view-widget.scss'
import ViewWindow from './viewWindow'
import { player } from './player'

class ViewWidget {
    container: HTMLDivElement;

    public createViewWidget(contentType: string): boolean {
        this.container = document.createElement('div');
        this.container.className = 'widget';
        switch (contentType) {
            case ViewWindow.CHART_VIEW_TITLE:
                this.createChartWidget();
                return true;
            case ViewWindow.VIDEO_VIEW_TITLE:
                this.createPlayerWidget();
                return true;
            case ViewWindow.KF_VIEW_TITLE:
                return false;
        }
    }

    public createChartWidget() {
        const checkboxContainer: HTMLLabelElement = document.createElement('label');
        checkboxContainer.className = 'checkbox-container';
        checkboxContainer.innerText = 'suggestion';
        const suggestBox: HTMLInputElement = document.createElement('input');
        suggestBox.id = 'suggestBox';
        suggestBox.type = 'checkbox';
        checkboxContainer.appendChild(suggestBox);
        const checkMark: HTMLSpanElement = document.createElement('span');
        checkMark.className = 'checkmark';
        checkboxContainer.appendChild(checkMark);
        this.container.appendChild(checkboxContainer);
    }

    public createPlayerWidget() {
        player.createPlayer
        this.container.appendChild(player.widget);
    }
}

export default ViewWidget;
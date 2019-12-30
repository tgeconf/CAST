import '../assets/style/floating-window.scss';

export default class FloatingWindow {
    static TYPE_EXAMPLE: string = 'exampleContainer';

    floatingWindow: HTMLDivElement;

    public createFloatingWindow(id: string) {
        //create the background container
        this.floatingWindow = document.createElement('div');
        this.floatingWindow.id = id;
        this.floatingWindow.className = 'floating-bg';
        //create window
        const fWindow:HTMLDivElement = document.createElement('div');
        fWindow.className = 'f-window';
        const windowTitle:HTMLDivElement = document.createElement('div');
        windowTitle.className = 'title-wrapper';
        const titleContent:HTMLDivElement = document.createElement('div');
        titleContent.className = 'title-content';
        titleContent.innerHTML = 'examples' 
        windowTitle.appendChild(titleContent);
        const closeBtn:HTMLSpanElement = document.createElement('span');
        closeBtn.className = 'title-btn';
        const closeIcon:HTMLSpanElement = document.createElement('span');
        closeIcon.className = 'btn-icon close-icon';
        closeBtn.appendChild(closeIcon);
        windowTitle.appendChild(closeBtn);
        fWindow.appendChild(windowTitle);
        //create window content
        const windowContent: HTMLDivElement = document.createElement('div');
        windowContent.className = 'content-wrapper';
        fWindow.appendChild(windowContent);
        this.floatingWindow.appendChild(fWindow);

        switch (id) {
            case FloatingWindow.TYPE_EXAMPLE:

                break;
            default:
                break;
        }
    }
}
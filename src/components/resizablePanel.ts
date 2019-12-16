import '../assets/style/panel.scss'

export default class ResizablePanel {
    static panelNum: number = 0;

    /**
     * create two panels and one resizer
     */
    public static createRPanels(p1: number, p2: number, verticle: boolean = true) {
        const wrapper = this.createWrapper();
        const panel1 = this.createPanel(p1, verticle);
        const panel2 = this.createPanel(p2, verticle);
        if (verticle) {
            panel2.style.marginTop = '-3px';
        } else {
            panel2.style.marginLeft = '-3px';
        }

        const resizer = this.createResizer(panel1.id, panel2.id, verticle);
        wrapper.appendChild(panel1);
        wrapper.appendChild(resizer);
        wrapper.appendChild(panel2);
        return {
            wrapper: wrapper,
            panel1: panel1,
            panel2: panel2
        };
    }

    public static createWrapper() {
        const wrapper = document.createElement('div');
        wrapper.className = 'panel-wrapper';
        return wrapper;
    }

    /**
     * create one panel
     * @param percent: 0 - 10, size of the panel
     * @param verticle: default creating verticle panels
     */
    public static createPanel(percent: number, verticle: boolean = true) {
        const panel = document.createElement('div');
        panel.className = 'panel';
        panel.id = 'panel' + this.panelNum;
        this.panelNum++;

        if (verticle) {
            panel.style.height = 'calc(' + percent * 10 + '% - 0.5px)';
        } else {
            panel.style.width = 'calc(' + percent * 10 + '% - 0.5px)';
        }

        return panel;
    }

    public static createResizer(panelId1: string, panelId2: string, verticle: boolean = true) {

        const resizer = document.createElement('div');
        resizer.className = verticle ? 'v-resizer' : 'h-resizer';
        const resizeBar = document.createElement('div');
        resizeBar.className = 'resize-bar';
        resizer.appendChild(resizeBar);

        resizer.onmousedown = (downEvt) => {
            const wrapperBBox = {
                width: resizer.parentElement.offsetWidth,
                height: resizer.parentElement.offsetHeight
            }
            downEvt.preventDefault();
            let downPosi = {
                x: downEvt.pageX,
                y: downEvt.pageY
            }
            document.onmousemove = (moveEvt) => {
                const movePosi = {
                    x: moveEvt.pageX,
                    y: moveEvt.pageY
                }
                const dis = {
                    xDiff: movePosi.x - downPosi.x,
                    yDiff: movePosi.y - downPosi.y
                }
                if (verticle) {
                    const disPercent = dis.yDiff / wrapperBBox.height * 100;
                    const height1 = parseFloat(document.getElementById(panelId1).style.height.split('%')[0].split('(')[1]);
                    const height2 = parseFloat(document.getElementById(panelId2).style.height.split('%')[0].split('(')[1]);
                    document.getElementById(panelId1).style.height = 'calc(' + (height1 + disPercent) + '% - 0.5px)';
                    document.getElementById(panelId2).style.height = 'calc(' + (height2 - disPercent) + '% - 0.5px)';
                } else {
                    const disPercent = dis.xDiff / wrapperBBox.width * 100;
                    const width1 = parseFloat(document.getElementById(panelId1).style.width.split('%')[0].split('(')[1]);
                    const width2 = parseFloat(document.getElementById(panelId2).style.width.split('%')[0].split('(')[1]);
                    document.getElementById(panelId1).style.width = 'calc(' + (width1 + disPercent) + '% - 0.5px)';
                    document.getElementById(panelId2).style.width = 'calc(' + (width2 - disPercent) + '% - 0.5px)';
                }
                downPosi = movePosi;
            }
            document.onmouseup = (upEvt) => {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        return resizer;
    }
}
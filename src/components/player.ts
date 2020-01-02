import '../assets/style/player.scss'

import Slider from './slider'

class Player {
    //lottieJSON:any
    widget: HTMLDivElement;
    playing: boolean;
    currentTime: number;
    totalTime: number;

    constructor() {
        this.currentTime = 0;
        this.totalTime = 0;
        this.playing = false;
        this.createPlayer();
    }

    public createPlayer(): void {
        this.widget = document.createElement('div');
        this.widget.style.minWidth = (0.98 * window.innerWidth / 2).toString() + 'px';
        const playBtnWrapper: HTMLDivElement = document.createElement('div');
        playBtnWrapper.className = 'play-btn-wrapper';
        playBtnWrapper.title = 'Play';
        const playCheck: HTMLInputElement = document.createElement('input');
        playCheck.type = 'checkbox';
        playCheck.value = 'None';
        playCheck.id = 'playBtn';
        playCheck.name = 'check';
        playCheck.checked = true;
        playBtnWrapper.appendChild(playCheck);
        const playLabel: HTMLLabelElement = document.createElement('label');
        playLabel.setAttribute('for', 'playBtn');
        playLabel.setAttribute('tabindex', '1');
        playBtnWrapper.appendChild(playLabel);
        playCheck.onclick = (e) => {
            if (this.playing) {
                this.playing = false;
                playBtnWrapper.title = 'Play';
            } else {
                this.playing = true;
                playBtnWrapper.title = 'Stop';
            }
        }
        this.widget.appendChild(playBtnWrapper);

        const slider: Slider = new Slider([0, 1], 0, true, 5, 2, 0.98 * window.innerWidth / 2 - 146);
        this.widget.appendChild(slider.createSlider());

        const timeWrapper: HTMLDivElement = document.createElement('div');
        timeWrapper.className = 'time-span-wrapper';
        const currentTimeSpan: HTMLSpanElement = document.createElement('span');
        currentTimeSpan.id = 'currentTime';
        currentTimeSpan.innerText = this.formatTime(this.currentTime);
        const splitSpan: HTMLSpanElement = document.createElement('span');
        splitSpan.innerText = '/';
        const totalTimeSpan: HTMLSpanElement = document.createElement('span');
        totalTimeSpan.id = 'totalTime';
        totalTimeSpan.innerText = this.formatTime(this.totalTime);
        timeWrapper.appendChild(currentTimeSpan);
        timeWrapper.appendChild(splitSpan);
        timeWrapper.appendChild(totalTimeSpan);
        this.widget.appendChild(timeWrapper);

    }

    /**
     * 00:00.00
     * @param time : time in ms
     */
    public formatTime(time: number): string {
        const minNum: number = Math.floor(time / 60000);
        const secNum: number = Math.floor((time - minNum * 60000) / 1000);
        const msNum: number = Math.floor((time - minNum * 60000 - secNum * 1000) / 10);
        const minStr: string = minNum < 10 ? '0' + minNum.toString() : minNum.toString();
        const secStr: string = secNum < 10 ? '0' + secNum.toString() : secNum.toString();
        const msStr: string = msNum < 10 ? '0' + msNum.toString() : msNum.toString();
        return minStr + ':' + secStr + '.' + msStr;
    }
}

export let player = new Player();
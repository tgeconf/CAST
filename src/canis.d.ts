declare module 'canis_toolkit' {
    export default class Canis {
        public canisObj: any;
        public frameRate: number;
        duration(): number;
        renderSpec(spec: any, callback: any): any;
        reset(): void;
        exportJSON(): string;
        test(): void;
    }
    export class ActionSpec {
        static actionTypes: any;
        static actionTargets: any;
        static targetAnimationType: any;
        static easingType: any;
        public chartIdx: number;
        public _type: string;
        public animationType: string
        public _easing: string;
        public _duration: number;
        public startTime: number;
        public attribute: any;
    }
}
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
}
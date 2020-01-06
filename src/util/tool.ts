export default class Tool {
    public static firstLetterUppercase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    public static pointDist(x1: number, x2: number, y1: number, y2: number): number {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }
    public static arrayContained(a: any[], b: any[]): boolean {
        if (a.length < b.length) return false;
        for (var i = 0, len = b.length; i < len; i++) {
            if (a.indexOf(b[i]) == -1) return false;
        }
        return true;
    }
    public static resizeSVG(svg: HTMLElement, w: number, h: number): void {
        let oriViewbox: string[] = svg.getAttribute('viewBox').split(' ');
        svg.setAttribute('width', w.toString());
        svg.setAttribute('height', h.toString())
        svg.setAttribute('viewBox', oriViewbox[0] + ' ' + oriViewbox[1] + ' ' + w + ' ' + h);
    }
}
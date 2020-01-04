export default class Tool {
    public static firstLetterUppercase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    public static pointDist(x1: number, x2: number, y1: number, y2: number): number {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }
}
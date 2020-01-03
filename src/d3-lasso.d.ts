declare module 'd3-lasso' {
    export interface LassoInstance {
        // items: any[];
        // closePathDistance: number,
        // closePathSelect: boolean,
        // isPathClosed: boolean,
        // hoverSelect: boolean,
        // targetArea: any;
        // on: any;
        (_this: any): void;
        items(a: any): LassoInstance;
        possibleItems(): any;
        selectedItems(): any;
        notPossibleItems(): any;
        notSelectedItems(): any;
        closePathDistance(a: any): LassoInstance;
        closePathSelect(a: any): LassoInstance;
        isPathClosed(a: any): LassoInstance;
        hoverSelect(a: any): LassoInstance;
        on(a: string, b: any): any;
        targetArea(a: any): any;
    }
    export function lasso(): LassoInstance;

}
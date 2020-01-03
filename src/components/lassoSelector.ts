import '../assets/style/lasso.scss'
import * as d3 from 'd3'
import { lasso } from 'd3-lasso'

class LassoSelector {
    selectedMarks: string[];
    public createContainer(w: number, h: number): SVGSVGElement {
        const lassoContainer: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lassoContainer.setAttributeNS(null, 'id', 'lassoContainer');
        lassoContainer.setAttributeNS(null, 'width', w.toString());
        lassoContainer.setAttributeNS(null, 'height', h.toString());
        lassoContainer.setAttributeNS(null, 'style', 'margin-top: -' + h + 'px');
        document.getElementById('chartContainer').appendChild(lassoContainer);
        return lassoContainer;
    }
    public removeContainer() {
        if (document.getElementById('lassoContainer'))
            document.getElementById('lassoContainer').remove();
    }
    public createSelector() {
        // let la = lasso();
        // la.closePathSelect(true);
        console.log(d3.selectAll('#visChart .mark'), d3.select('#lassoContainer'));
        let l = lasso();
        l.closePathSelect(true)
            .closePathDistance(100)
            .items(d3.selectAll('#visChart .mark'))
            .targetArea(d3.select('#lassoContainer'))
            .on('start', () => {
                console.log('start');
            })
            .on('draw', () => {
                console.log('draw');
            })
            .on('end', () => {
                console.log('end');
            })
        // const lasso_start = () => {
        //     lasso.items()
        // }
        console.log(l);

    }
}

export let lassoSelector = new LassoSelector();
import '../../assets/style/timeline.scss'
import * as d3 from 'd3'

type TDim = {
    width: number
    height: number
    dx: number
    dy: number
}

export default class Timeline {
    public static d3svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    public static xScale: d3.ScaleTime<number, number>;
    public static xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>, x: any) => g.
        call(d3.axisBottom(x)
            .tickSize(0)
            .tickFormat(d3.timeFormat('%M:%S.%L')))
        // .tickFormat(d3.timeFormat('%M:%S')))
    public static xAxisG: d3.Selection<SVGGElement, unknown, null, undefined>;

    public static timelineDim: TDim;
    public static duration: number;

    public static initTimeline(svg: SVGSVGElement) {
        this.d3svg = d3.select(svg);
    }

    public static updateTimelineProps(td: TDim, duration: number) {
        console.log('updating timeline: ', td, duration);
        this.timelineDim = td;
        this.duration = duration;
        // this.timelineDim = {
        //     width: 1000,
        //     height: 100,
        //     dx: 100,
        //     dy: 100
        // }
        // this.duration = 1350;
        this.drawTimeline();
    }

    public static drawTimeline() {
        if (typeof this.d3svg !== 'undefined') {
            this.d3svg.selectAll('*').remove();
            const zoom = d3.zoom()
                .extent([[this.timelineDim.dx, this.timelineDim.dy], [this.timelineDim.width - (this.timelineDim.dx * 2), this.timelineDim.height - this.timelineDim.dy]])
                .scaleExtent([1, 10])
                .translateExtent([[this.timelineDim.dx, this.timelineDim.dy], [this.timelineDim.width - (this.timelineDim.dx * 2), this.timelineDim.height - this.timelineDim.dy]])
                .on("zoom", this.zoomed);
            this.xScale = d3.scaleTime()
                .domain([new Date(0), new Date(this.duration)])
                .range([0, this.timelineDim.width])
                .nice();
            const yScale = d3.scaleLinear()
                .domain([0, this.timelineDim.height])
                .range([this.timelineDim.height, 0]);
            const yAxis = d3.axisLeft(yScale)
                .ticks(5)
                .tickSize(-this.timelineDim.width);
            this.d3svg.call(zoom);
            this.d3svg.append("rect")
                .attr('class', 'timeline-bg')
                .attr("width", this.timelineDim.width)
                .attr("height", this.timelineDim.height)
                .call(zoom);
            this.xAxisG = this.d3svg.append("g")
                .attr('id', 'timelineXAxis')
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.timelineDim.height + ")")
                .call(this.xAxis, this.xScale);
            this.d3svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
        }
    }
    public static zoomed() {
        const newXScale = d3.event.transform.rescaleX(Timeline.xScale);
        Timeline.xAxisG.call(Timeline.xAxis, newXScale);
    }

}

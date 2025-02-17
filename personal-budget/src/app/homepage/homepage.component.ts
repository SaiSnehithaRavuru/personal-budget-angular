import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  public dataSource = {
    datasets: [{ data: [], backgroundColor: ['#ffcd56', '#ff6384', '#36a2eb', '#fd6b19'] }],
    labels: [],
  };

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.dataService.getBudgetData().subscribe((data: any) => {
      this.dataSource.datasets[0].data = data.myBudget.map((item: any) => item.budget);
      this.dataSource.labels = data.myBudget.map((item: any) => item.title);

      this.createChart(); // Chart.js Pie Chart
      this.createD3Chart(data.myBudget); // D3 Donut Chart
    });
  }

  createChart() {
    const ctx = this.elementRef.nativeElement.querySelector('#myChart') as HTMLCanvasElement;
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: 'pie',
      data: this.dataSource,
    });
  }

  createD3Chart(data: any[]) {
    d3.select("#d3DonutChart").selectAll("*").remove(); // Clear previous chart

    const width = 400, height = 400, radius = Math.min(width, height) / 2;

    const svg = d3.select("#d3DonutChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10); // Basic color scale
    const pie = d3.pie<any>().value((d: any) => d.budget); // Convert data to pie slices

    const arc = d3.arc<d3.PieArcDatum<any>>().innerRadius(100).outerRadius(radius); // Donut shape

    svg.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", (d) => arc(d)!) // FIXED: Call arc function with 'd'
      .attr("fill", (d) => color(d.data.title))
      .style("stroke", "#fff");

    const textArc = d3.arc<d3.PieArcDatum<any>>().innerRadius(120).outerRadius(radius); // Position labels inside

    svg.selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${textArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#fff")
      .text((d) => d.data.title);
  }
}
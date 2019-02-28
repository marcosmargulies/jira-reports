import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-area',
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.css']
})
export class ChartAreaComponent implements OnInit {

  constructor(private dataService:DataService) { 
    // var data = dataService.getData();
    // console.log("tickets from jira:");
    // console.log(data);
    // this.chartData = data; // TODO: format something here
  }

  ngOnInit() {
    this.dataService.getDaysPerStatus()
      .subscribe((data) => {
        console.log("tickets from jira:");
        console.log(data);
        this.chartData = data;
        console.log(this.chartData);
      });
  }

  public chartData: Array<any> = [];

  public chartLabels: Array<any> = ['Open', 'In Progress', 'Blocked', 'Code Review', 'Merged', 'On Test Env', 'Closed'];

  public chartOptions: any = {
    responsive: true
  };
  public chartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public chartLegend: boolean = true;
  public chartType: string = 'bar';

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
}
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import { CommonModule } from '@angular/common';
import { count } from 'rxjs/internal/operators/count';

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
        console.log("tickets from jira:"); console.dir(data);
        let d = data.map((d) => {
          // console.log("data:"); console.dir(d);
          // map to buckets of Open, In Progress, Blocked, Code Review, Merged, TestInDev, TestInSit, Closed
          return {
            label: d.key,
            data: (function(element) {
              const duration:Number = 86400000; // days
              let flattenedStatus:Array<any> = [];
              if (element.statusHistory.length == 0) {
                // consider only current state as there is no status history recorded
                flattenedStatus.push({
                  status: element.status,
                  duration: Math.abs(Date.now() - new Date(element.created)) / duration
                });
              } else {
                element.statusHistory.forEach(sh => {
                  let statusName:string = '';
                  switch (sh.from) {
                    case 'Backlog':
                    case 'Open':
                    case 'Reopened':
                    case 'Reopen':
                    case 'ToDo':
                    case 'Created':
                      statusName = 'Open';
                      break;
                    case 'InProgress':
                      statusName = 'WIP';
                      break;
                    case 'Blocked':
                      statusName = 'Blocked';
                      break;
                    case 'CodeReview':
                      statusName = 'Code Review';
                      break;
                    case 'Merged':
                      statusName = 'Merged';
                      break;
                    case 'OnTestEnv':
                    case 'InTestInTst':
                      statusName = 'On Test Env';
                      break;
                    case 'ReadyForMergeToDev':
                      statusName = 'Ready to merge to DEV';
                      break;
                    case 'InTestInDev':
                    case 'InDevQA':
                      statusName = 'Dev test';
                      break;
                    case 'ReadyForMergeToMaster':
                    case 'MergedToMaster':
                    case 'FixToMaster':
                    case 'MasterFixCodeReview':
                      statusName = 'Merging to Master';
                      break;
                    case 'SitReady':
                      statusName = 'SIT ready';
                      break;
                    case 'OnSitEnv':
                    case 'InTestInSit':
                      statusName = 'ON SIT env';
                      break;
                    case 'OatReady':
                      statusName = 'OAT Ready';
                      break;
                    case 'OnOatEnv':
                      statusName = 'On OAT Env';
                      break;
                    case 'ProductionReady':
                      statusName = 'PROD Ready';
                      break;
                    case 'Live':
                    case 'Closed':
                    case 'Done':
                    case 'Rejected':
                      statusName = 'Closed';
                      break;
                    default:
                      statusName = 'Not mapped: ' + sh.from;
                      break;
                  }
                  flattenedStatus.push({
                    status: statusName,
                    duration: sh.transitionDurationDays 
                  });
                });
              };
              let arr:Array<any> = [];

              return arr;
            })(d)
          }
        });
        d.forEach(element => {
          console.dir(element);
        });
        //this.chartData.push(data[0]);

        //console.log(this.chartData);
      });
  }

  // let data:Array<any> = [
    //   { data: [23.6514946519796, 3.31491141831972, 0.668417511820244, 0.969977977951708, 0, 1.23725997244995, 2.54439801743686], label: 'Average ' },
    //   { data: [0, 0, 0, 0, 0, 0, 0], label: 'TP-3069' },
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
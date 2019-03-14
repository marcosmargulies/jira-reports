import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import { CommonModule } from '@angular/common';
import { count } from 'rxjs/internal/operators/count';

interface FlatStatus {
  status: string,
  duration: number
}

@Component({
  selector: 'app-chart-area',
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.css']
})
export class ChartAreaComponent implements OnInit {

  constructor(private dataService:DataService) { 
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
              const duration:number = 86400000; // days
              let flattenedStatus:FlatStatus[] = [];
              if (element.statusHistory.length == 0) {
                // consider only current state as there is no status history recorded
                flattenedStatus.push({
                  status: element.status,
                  duration: Math.abs(Date.now() - new Date(element.created).getTime()) / duration
                });
              } else {
                element.statusHistory.forEach(sh => {
                  let statusName:string = '';
                  switch (sh.from.split(' ').join('').toLowerCase()) {
                    case 'backlog':
                    case 'open':
                    case 'reopened':
                    case 'reopen':
                    case 'todo':
                    case 'created':
                      statusName = 'Open';
                      break;
                    case 'inprogress':
                      statusName = 'WIP';
                      break;
                    case 'blocked':
                      statusName = 'Blocked';
                      break;
                    case 'codereview':
                      statusName = 'Code Review';
                      break;
                    case 'merged':
                      statusName = 'Merged';
                      break;
                    case 'ontestenv':
                    case 'intestintst':
                      statusName = 'On Test Env';
                      break;
                    case 'readyformergetodev':
                      statusName = 'Ready to merge to DEV';
                      break;
                    case 'intestindev':
                    case 'indevqa':
                      statusName = 'Dev test';
                      break;
                    case 'readyformergetomaster':
                    case 'mergedtomaster':
                    case 'fixtomaster':
                    case 'masterfixcodereview':
                      statusName = 'Merging to Master';
                      break;
                    case 'sitready':
                      statusName = 'SIT ready';
                      break;
                    case 'onsitenv':
                    case 'intestinsit':
                      statusName = 'On SIT env';
                      break;
                    case 'oatready':
                      statusName = 'OAT Ready';
                      break;
                    case 'anaatenv':
                      statusName = 'On OAT Env';
                      break;
                    case 'productionready':
                      statusName = 'PROD Ready';
                      break;
                    case 'live':
                    case 'closed':
                    case 'done':
                    case 'rejected':
                      statusName = 'Closed';
                      break;
                    default:
                      statusName = 'Not mapped: ' + sh.from;
                      console.error('status not mapped: ' + statusName);
                      break;
                  }
                  // add or update // TODO: specialized Dic-object for that
                  if (flattenedStatus.find(i => i.status === statusName)) {
                    let fs = flattenedStatus.find(i => i.status === statusName);
                    fs.duration += sh.transitionDurationDays;
                  } else {
                    flattenedStatus.push({
                      status: statusName,
                      duration: sh.transitionDurationDays 
                    });
                  }
                });
              };
              console.log('dumping flat stats');
              console.dir(flattenedStatus);
              // map to buckets of Open, In Progress, Blocked, Code Review, Merged, TestInDev, TestInSit, Closed
              let arr:Array<any> = [];
              let tmpVal:FlatStatus;
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'Open')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'WIP')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'Blocked')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'Code Review')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'Ready to merge to DEV')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'Dev test')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'On SIT env')) ? tmpVal.duration : 0);
              arr.push((tmpVal = flattenedStatus.find(i => i.status === 'Closed')) ? tmpVal.duration : 0);
              return arr;
            })(d)
          }
        });
        // d.forEach(element => {
        //   console.dir(element);
        // });
        console.log('d:');
        console.dir(d);
        this.chartData = d;
        //this.chartData.push(data[0]);

        //console.log(this.chartData);
      });
  }

  // let data:Array<any> = [
    //   { data: [23.6514946519796, 3.31491141831972, 0.668417511820244, 0.969977977951708, 0, 1.23725997244995, 2.54439801743686], label: 'Average ' },
    //   { data: [0, 0, 0, 0, 0, 0, 0], label: 'TP-3069' },
  public chartData: Array<any> = [];

  public chartLabels: Array<any> = ['Open', 'In Progress', 'Blocked', 'Code Review', 'Ready to merge to DEV', 'Dev Test', 'On SIT env', 'Closed'];

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
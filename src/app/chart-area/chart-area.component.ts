import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../services/data-service.service';

interface FlatStatus {
  status: string;
  duration: number;
}

@Component({
  selector: 'app-chart-area',
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.css']
})
export class ChartAreaComponent implements OnInit {
  constructor(private dataService: DataService) { }
  query = '';

  public chartDataFiltered: Array<any> = [];

  public chartLabelsFiltered: Array<string> = [];

  public chartDataTotal: Array<number> = [];
  public chartData: Array<any> = [];

  public chartLabels: Array<string> = [
    'Open',
    'In Progress',
    'Blocked',
    'Code Review',
    'Merged',
    'On Test Env',
    'Ready to merge to DEV',
    'Dev Test',
    'Merging to Master',
    'SIT ready',
    'On SIT env',
    'OAT Ready',
    'On OAT Env',
    'PROD Ready',
    'Closed',
  ];

  public chartOptions: any = {
    responsive: true
  };

  public chartLegend = true;
  public chartType = 'bar';

  ngOnInit() {
    this.query = 'key in (TP-4897, TP-2934)';
    // "project ="Rooms V2 (March)" and Sprint in (1967) and type in (Story, Task, Improvement, Bug)";
    // 'project = "Trip Planner" and "Scrum Team" = "Space Invaders" and Sprint in (openSprints())';
    this.createChart();
  }

  createChart() {
    this.dataService.getDaysPerStatus(this.query).subscribe(data => {
      console.log('tickets from jira:');
      console.dir(data);
      const chartData = data.map(d => {
        // console.log("data:"); console.dir(d);
        // map to buckets of Open, In Progress, Blocked, Code Review, Merged, TestInDev, TestInSit, Closed
        return {
          label: d.key,
          data: (function (element) {
            const duration = 86400000; // days
            const flattenedStatus: FlatStatus[] = [];
            if (element.statusHistory.length === 0) {
              // consider only current state as there is no status history recorded
              flattenedStatus.push({
                status: element.status,
                duration:
                  Math.abs(Date.now() - new Date(element.created).getTime()) /
                  duration
              });
            } else {
              element.statusHistory.forEach(sh => {
                let statusName = '';
                switch (
                sh.from
                  .split(' ')
                  .join('')
                  .toLowerCase()
                ) {
                  case 'new':
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
                  case 'onoatenv':
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
                  const fs = flattenedStatus.find(i => i.status === statusName);
                  fs.duration += sh.transitionDurationDays;
                } else {
                  flattenedStatus.push({
                    status: statusName,
                    duration: sh.transitionDurationDays
                  });
                }
              });
            }
            // console.log('dumping flat stats');
            // console.dir(flattenedStatus);
            // map to buckets of Open, In Progress, Blocked, Code Review, Merged, TestInDev, TestInSit, Closed
            const arr: Array<any> = [];
            // if (flattenedStatus.find(i => i.status === 'Open')) {
            // arr.push
            // }
            let tmpVal: FlatStatus;
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Open'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'WIP'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Blocked'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Code Review'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Merged'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'On Test Env'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(
                i => i.status === 'Ready to merge to DEV'
              ))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Dev test'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Merging to Master'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'SIT Ready'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'On SIT env'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'OAT Ready'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'On OAT Env'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'PROD Ready'))
                ? tmpVal.duration
                : 0
            );
            arr.push(
              (tmpVal = flattenedStatus.find(i => i.status === 'Closed'))
                ? tmpVal.duration
                : 0
            );
            return arr;
          })(d)
        };
      });
      // d.forEach(element => {
      //   console.dir(element);
      // });
      // console.log('d:');
      // console.dir(d);



      this.chartData = chartData;
      this.chartDataFiltered = this.chartData;
      this.chartLabelsFiltered = this.chartLabels;
      // this.chartData.push(data[0]);

      // console.log(this.chartData);
      this.calculateAverage();
    });
  }

  public calculateAverage() {
    const average = {
      label: 'Average',
      type: 'line',
      visible: false,
      data: Array<number>()
    };
    const control: Array<number> = [];

    for (let l = 0; l < this.chartLabels.length; l++) {
      average.data[l] = 0;
      control[l] = 0;
    }

    for (const d of this.chartDataFiltered) {
      for (let _i = 0; _i < d.data.length; _i++) {
        if (d.data[_i] > 0) {
          control[_i]++;
          average.data[_i] += d.data[_i];
        }
      }
    }
    for (const index in average.data) {
      if (control[index] > 0) {
        this.chartDataTotal[index] = average.data[index];
        average.data[index] = average.data[index] / control[index];
      }
    }
    console.log(this.chartDataTotal);
    this.chartDataFiltered.push(average);
  }

  // events
  public chartClicked(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {
        const datasetLabel = activePoints[0]._model.datasetLabel;
        // get the internal index of slice in chart
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex];
        // get value by index
        const value = chart.data.datasets[0].data[clickedElementIndex];
        // console.log(clickedElementIndex, label, value, datasetLabel)
        if (datasetLabel) {
          window.open(
            'https://jira.ryanair.com:8443/browse/' + datasetLabel,
            '_blank'
          );
        }
      }
    }
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  onEnter(value: string) {
    this.chartDataFiltered = new Array<any>();
    this.query = value;
    this.createChart();
  }

  CheckFieldsChange(values: any) {
    /* console.log(values.currentTarget.value);
    console.log(values.currentTarget.checked);
    console.log(this.chartLabels.indexOf(values.currentTarget.value)); */
    return;

    if (values.currentTarget.checked) {

      // const index = this.chartLabels.indexOf(values.currentTarget.value);
      this.chartLabelsFiltered = this.chartLabels;
      this.chartDataFiltered = this.chartData;

    } else {

      const index = this.chartLabels.indexOf(values.currentTarget.value);

      this.chartDataFiltered = Array.from(this.chartData);
      /*this.chartDataFiltered.forEach(element => {
        console.log(element);
        element.data = Array.from(element.data.filter((_, i) => index.indexOf(i) <= -1));
      });
*/
      for (let i = 0; i < this.chartDataFiltered.length; i++) {
        const element = this.chartDataFiltered[i];
        if (i === index) {
          console.log(element);
        }
      }

      this.chartLabelsFiltered = this.chartLabels.filter(obj => obj !== values.currentTarget.value);
      // this.chartDataFiltered = this.chartData.filter(obj => obj !== index);
    }
  }
}

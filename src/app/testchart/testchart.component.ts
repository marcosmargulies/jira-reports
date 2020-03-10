import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ArrayToCsvPipe } from '../pipes/array-to-csv.pipe';
import { GoogleChartInterface } from "ng2-google-charts/google-charts-interfaces";
import { DataPointPosition, BoundingBox, ChartHTMLTooltip } from "ng2-google-charts";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { ɵELEMENT_PROBE_PROVIDERS } from "@angular/platform-browser";
import { DataService } from "../services/data-service.service";

@Component({
  selector: "app-testchart",
  templateUrl: "./testchart.component.html",
  styleUrls: ["./testchart.component.css"]
})

export class TestchartComponent implements OnInit {
  private datasource: any[]= [];
  usedStatus: any[] = [];
  unusedStatus: any[] = [];
  jiraResult: any[] = [];
  jiraResultNoPipe: string = '';

  tableHeaders: string[] = [];
  tableHeadersLabels: any[] = [];
  headersBasicList: string[] = ['key', 'link', 'title', 'project', 'issueType', 'status', 'resolution'];
  tableData = new MatTableDataSource();

  jiraUrl: string = 'https://jira.ryanair.com/browse/';

  queryString: string = '';
  fileName: string = '';

  outputType: string = '';
  outputList: any[] = [
    {
      value: 'transitionDurationHours',
      label: 'Time (h)'
    },
    {
      value: 'fromDateTime',
      label: 'Date (MM/DD/YYYY HH:mm:ss)'
    },
    {
      value: 'all',
      label: 'All'
    }
  ];

  constructor(private dataService: DataService, private arrayToCsv: ArrayToCsvPipe) {}

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.queryString = 'project = "Ops Report" AND sprint in openSprints() AND type != Sub-task AND type != "Test Bug"';
    this.outputType = this.outputList[0].value;

    this.getDataFromJIRA(this.queryString);
  }

  getDataFromJIRA(querString: string) {
    this.datasource = [];
    this.usedStatus = [];
    this.unusedStatus = [];
    this.jiraResult = [];
    this.jiraResultNoPipe = '';

    this.dataService.getDaysPerStatus(querString).subscribe(data => {
      this.jiraResult = data;

      console.log('----tickets from jira');
      console.dir(data);

      this.datasource = this.pretifyJiraData(data);
      console.log('----datasource');
      console.log(this.datasource);

      this.usedStatus = this.getStatus(data);
      console.log('----usedStatus');
      console.log(this.datasource);

      let parseData = this.parseTableData(data);
      this.tableData = new MatTableDataSource(parseData);
      this.tableData.paginator = this.paginator;
      this.tableData.sort = this.sort;
      console.log('----tableData');
      console.log(this.tableData);

      this.updateTableHeaders(data, this.usedStatus);
      this.jiraResultNoPipe = this.parseJiraResultsNoPipe();

      this.refreshChart();
    });
  }

  pretifyJiraData(jiraData: any) {
    let parseData = [];

    jiraData.forEach(element => {
      let item = {
        key: element.key,
        title: element.title,
        status: element.status,
        data: {}
      };

      element.statusHistory.forEach(history => {
        item.data[history.from] = history.transitionDurationDays;
      });

      parseData.push(item);
    });

    return parseData;
  }

  getStatus(jiraData: any) {
    let statusList = [];

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (statusList.indexOf(history.from) < 0) {
          statusList.push(history.from);
        }
      });
    });

    return statusList;
  }

  updateTableHeaders(jiraData: any, currentStatus: string[]) {
    this.tableHeaders = this.getTableHeaders(jiraData, currentStatus);
    this.tableHeadersLabels = this.getTableHeadersLabels(jiraData, currentStatus);

    console.log('----tableHeaders');
    console.log(this.tableHeaders);
  }

  parseJiraResultsNoPipe() {
    // let jiraResults = this.tableHeaders.join(',');
    let jiraResults = '';
    let headerValues = [];
    
    this.tableHeadersLabels.forEach(headerLabel => {
      //jiraResults += headerLabel.label + ',';
      jiraResults += `${headerLabel.label},`;
      headerValues.push(headerLabel.value);
    });  

    this.tableData.data.forEach(jiraDataRow => {
      jiraResults += '\n';
      headerValues.forEach(function(header, i) {
        if (jiraDataRow[header] && typeof jiraDataRow[header] === 'string') {
          // Remove commas
          jiraDataRow[header] = (jiraDataRow[header].indexOf(',') != -1) ? jiraDataRow[header].split(',').join('') : jiraDataRow[header];
        }
        jiraResults += (i !== 0) ? ',' : '';
        jiraResults += (jiraDataRow[header]) ? `${jiraDataRow[header]}` : '';
      });
    });

    return jiraResults;
  }

  parseTableData(jiraData: any) {
    let tableInformation = [];

    jiraData.forEach(element => {
      let newElement = {
        key: element.key,
        link: this.jiraUrl + element.key,
        title: element.title,
        project: element.project,
        issueType: element.issuetype,
        status: element.status,
        resolution: element.resolution
      };

      element.statusHistory.forEach(history => {
        let timeLabel = 'transitionDurationHours';
        let dateLabel = 'fromDateTime';

        let timeName = history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1);
        let dateName = history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

        newElement[timeName] = Math.round(history[timeLabel] * 100) / 100;
        newElement[dateName] = this.formatDate(history[dateLabel]);
      });

      tableInformation.push(newElement);
    });

    return tableInformation;
  }

  formatDate(statusDate: string) {
    let formatDate = new Date(statusDate);

    let formatter = new Intl.DateTimeFormat('en-us', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    return formatter.format(formatDate);
  }

  getTableHeaders(jiraData: any, currentStatus: string[]) {
    let headersList = this.headersBasicList.slice();
    let headerAllList = [];

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (headersList.indexOf(history.from) < 0 && currentStatus.indexOf(history.from) >= 0) {
          headersList.push(history.from);

          // Make each column differente and avoid duplicates
          if (this.outputType === 'all') {
            headerAllList.push(history.from + ' (h)');
          }
        }
      });
    });

    headersList = headersList.concat(headerAllList);

    return headersList;
  }

  getTableHeadersLabels(jiraData: any, currentStatus: string[]) {
    let headersList = [];

    this.headersBasicList.forEach(element => {
      headersList.push({label:element , value:element});
    });

    let labelsList = this.generateLabels(jiraData);
    
    headersList = headersList.concat(labelsList.start);
    headersList = headersList.concat(labelsList.end);

    console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡');
    console.log(headersList);

    return headersList;
  }

  generateLabels(jiraData: any) {
    let labels = {start: [], end:[]};
    let statusListed = [];

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (statusListed.indexOf(history.from) < 0 && this.usedStatus.indexOf(history.from) >= 0) {
          switch (this.outputType) {
            case 'transitionDurationHours':
              let timeLabel = 'transitionDurationHours';
              let timeName = history.from.replace(/ /g,'') + timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1);

              labels.start.push({
                label: history.from + ' (h)',
                value: timeName
              });
              break;

            case 'fromDateTime':
              let dateLabel = 'fromDateTime';
              let dateName = history.from.replace(/ /g,'') + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

              labels.start.push({
                label: history.from,
                value: dateName
              });
              break;
            
            default:
              let timeLabelAll = 'transitionDurationHours';
              let timeNameAll = history.from.replace(/ /g,'') + timeLabelAll.charAt(0).toUpperCase() + timeLabelAll.slice(1);

              let dateLabelAll = 'fromDateTime';
              let dateNameAll = history.from.replace(/ /g,'') + dateLabelAll.charAt(0).toUpperCase() + dateLabelAll.slice(1);

              // Labels to be added at the beginning of the final array
              labels.start.push({
                label: history.from + ' (h)',
                value: timeNameAll
              });

              // Labels to be added at the end of the final array
              labels.end.push({
                label: history.from,
                value: dateNameAll
              });
              break;
          }

          statusListed.push(history.from);
        }
      });
    });

    return labels;
  }

  private parseSource(): GoogleChartInterface["dataTable"] {
    let res: GoogleChartInterface["dataTable"] = [];

    let header: Array<any> = [];
    header.push("Keys");
    header.push("Average");
    this.datasource.forEach(element => {
      header.push(element.key);
    });
    res.push(header);

    for (let i = 0; i <= this.usedStatus.length; i++) {}
    this.usedStatus.forEach(_status => {
      let row: Array<any> = [];
      let total: number = 0;
      let control: number = 0;
      this.datasource.forEach(_dataSource => {
        row.push(_dataSource.data[_status] || 0);
        total += _dataSource.data[_status] || 0;
        control += _dataSource.data[_status] ? 1 : 0;
      });
      // Add Average in the beggining of the Array
      row.unshift(total / control);
      row.unshift(_status);

      res.push(row);
    });
    console.log(res);
    return res;
  }

  public chartData: GoogleChartInterface = {
    chartType: "ComboChart",
    dataTable: this.parseSource(),
    //firstRowIsData: true,
    options: {
      title: 'Cycle time by JIRA keys',
      width: '100%',
      height: 600,
      vAxis: { 
        title: 'Time (in days)' 
      },
      hAxis: { 
        title: 'Status' 
      },
      seriesType: 'bars',
      series: { 
        0: { 
          type: 'line' 
        } 
      }
    }
  };

  downloadCsv(fileContent: string, fileName: string) {
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(fileContent);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + '.csv';
    hiddenElement.click();
    this.fileName = '';
  }  

  drop(event: CdkDragDrop<string[]>) {
    if (
      event.previousContainer.id === "cdk-drop-list-used" &&
      event.previousContainer.data.length === 1
    ) {
      return;
    }
    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      moveItemInArray(this.usedStatus, event.previousIndex, event.currentIndex);
    }
    console.log('*/*/*/*/*/*/* usedStatus */*/*/*/*/*/*');
    console.log(this.usedStatus);

    this.refreshChart();
    this.updateTableHeaders(this.jiraResult, this.usedStatus);
    this.jiraResultNoPipe = this.parseJiraResultsNoPipe();
  }

  updateOutput() {
    this.updateTableHeaders(this.jiraResult, this.usedStatus);
    this.jiraResultNoPipe = this.parseJiraResultsNoPipe();
  }

  refreshChart() {
    let ccComponent = this.chartData.component;
    ccComponent.data.dataTable = this.parseSource();
    //let ccWrapper = ccComponent.wrapper;
    //force a redraw
    ccComponent.draw();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableData.filter = filterValue.trim().toLowerCase();
  }
}

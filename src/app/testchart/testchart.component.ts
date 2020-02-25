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
  jiraResultNoPipe: any[] = [];

  tableHeaders: string[] = [];
  tableData = new MatTableDataSource();

  queryString: string = '';

  outputType: string = '';
  outputList: any[] = [
    {
      value: 'date',
      label: 'Date (YYYYMMDD)'
    },
    {
      value: 'dateandtime',
      label: 'Date (YYYYMMDD HH:mm:ss)'
    },
    {
      value: 'time',
      label: 'Time'
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

  jiraSearch(querString: string) {
    this.getDataFromJIRA(querString);
  }

  getDataFromJIRA(querString: string) {
    this.datasource = [];
    this.usedStatus = [];
    this.unusedStatus = [];
    this.jiraResult = [];
    this.jiraResultNoPipe = [];

    this.dataService.getDaysPerStatus(querString).subscribe(data => {
      this.jiraResult = data;
      this.jiraResultNoPipe = data;

      console.log('----tickets from jira');
      console.dir(data);

      this.datasource = this.pretifyJiraData(data);
      console.log('----datasource');
      console.log(this.datasource);

      this.usedStatus = this.getStatus(data);
      console.log('----usedStatus');
      console.log(this.datasource);

      this.createTable(data, this.usedStatus);
      this.refreshChart();
    });
  }

  createTable(jiraData: any, currentStatus: string[]) {
    let parseData = this.parseTableData(jiraData);
    this.tableHeaders = this.getTableHeaders(jiraData, currentStatus);

    this.tableData = new MatTableDataSource(parseData);
    this.tableData.paginator = this.paginator;
    this.tableData.sort = this.sort;

    console.log('----tableHeaders');
    console.log(this.tableHeaders);
    console.log('----tableData');
    console.log(this.tableData);
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

  downloadCsv(fileContent: string[], fileName: string) {
    let test = this.arrayToCsv.transform(fileContent, this.outputType);
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(test);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + '.csv';
    hiddenElement.click();
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
    this.createTable(this.jiraResult, this.usedStatus);
  }

  refreshChart() {
    let ccComponent = this.chartData.component;
    ccComponent.data.dataTable = this.parseSource();
    //let ccWrapper = ccComponent.wrapper;
    //force a redraw
    ccComponent.draw();
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

  parseTableData(jiraData: any) {
    let tableInformation = [];

    jiraData.forEach(element => {
      let test = {
        key: element.key,
        title: element.title,
        project: element.project,
        issueType: element.issuetype,
        status: element.status
      };

      element.statusHistory.forEach(history => {
        test[history.from] = Math.round(history.transitionDurationHours * 100) / 100;
      });

      tableInformation.push(test);
    });

    return tableInformation;
  }

  getTableHeaders(jiraData: any, currentStatus: string[]) {
    let headersList = ['key', 'title', 'project', 'issueType', 'status'];

    jiraData.forEach(element => {
      element.statusHistory.forEach(history => {
        if (headersList.indexOf(history.from) < 0 && currentStatus.indexOf(history.from) >= 0) {
          headersList.push(history.from);
        }
      });
    });

    return headersList;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableData.filter = filterValue.trim().toLowerCase();
  }
}

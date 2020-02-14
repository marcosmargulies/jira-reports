import { Component, OnInit } from "@angular/core";
import { GoogleChartInterface } from "ng2-google-charts/google-charts-interfaces";
import {
  DataPointPosition,
  BoundingBox,
  ChartHTMLTooltip,
  ChartMouseOverEvent
} from "ng2-google-charts";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import { ɵELEMENT_PROBE_PROVIDERS } from "@angular/platform-browser";
import { DataService } from "../services/data-service.service";

@Component({
  selector: "app-testchart",
  templateUrl: "./testchart.component.html",
  styleUrls: ["./testchart.component.css"]
})
export class TestchartComponent implements OnInit {
  query = "assignee=currentUser()";
  outputType = "date";

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getDataFromJIRA();
  }

  radioChanged(e: any) {
    this.outputType = e.target.value;
  }

  public mouseOver(event: ChartMouseOverEvent) {
    //console.log(event, event.columnLabel, ": ", event.value);
  }
  onEnter(value: string) {
    this.query = value;
    this.getDataFromJIRA();
  }

  getDataFromJIRA() {
    this.usedStatus = [];
    this.unusedStatus = [];
    this.jiraResult = [];
    
    this.dataService.getDaysPerStatus(this.query).subscribe(data => {
      this.jiraResult = data;

      console.log("tickets from jira:");
      console.dir(this.jiraResult);
      this.pretifyJiraData(this.jiraResult);
      this.refreshChart();
      console.log(this.parseSource());
    });
  }

  usedStatus = [];
  unusedStatus = [];
  private datasource = [];
  jiraResult = [];

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
      title: "Cycle time by JIRA keys",
      width: 1300,
      height: 600,
      vAxis: { title: "Time (in days)" },
      hAxis: { title: "Status" },
      seriesType: "bars",
      series: { 0: { type: "line" } }
    }
  };

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
    console.log(this.usedStatus);

    this.refreshChart();
  }

  refreshChart() {
    let ccComponent = this.chartData.component;
    ccComponent.data.dataTable = this.parseSource();
    //let ccWrapper = ccComponent.wrapper;
    //force a redraw
    ccComponent.draw();
  }

  private pretifyJiraData(jiraData: any) {
    this.datasource = [];
    this.usedStatus = [];

    jiraData.forEach(element => {
      let localData = new Object();
      element.statusHistory.forEach(history => {
        // Add new status to total statuses array
        if (this.usedStatus.indexOf(history.from) < 0) {
          this.usedStatus.push(history.from);
        }
        localData[history.from] = history.transitionDurationDays;
      });

      let item = {
        key: element.key,
        title: element.title,
        status: element.status,
        data: localData
      };
      this.datasource.push(item);
    });
  }
}

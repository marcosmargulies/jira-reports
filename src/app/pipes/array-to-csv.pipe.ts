import { Pipe, PipeTransform } from "@angular/core";
import { DatePipe } from "@angular/common";

@Pipe({
  name: "arrayToCsvPipe"
})
export class ArrayToCsvPipe extends DatePipe implements PipeTransform {
  transform(value: Array<any>, args?: any): string {
    if (value) {
      let statuses = [];
      let dataSource = [];

      value.forEach(element => {
        let localData = new Object();
        element.statusHistory.forEach(history => {
          // Add new status to total statuses array
          if (statuses.indexOf(history.from) < 0) {
            statuses.push(history.from);
          }
          localData[history.from] = history.fromDateTime;
        });

        let item = {
          key: element.key,
          title: element.title,
          status: element.status,
          type: element.issuetype,
          resolution: element.resolution,
          data: localData
        };

        dataSource.push(item);
      });

      let statusHeader = "";
      if (args === "all") {
        statuses.forEach(status => {
          statusHeader += `${status} Date,${status} Time,`;
        });
      } else {
        statusHeader = statuses.join(",") + ",";
      }
      let response = `ID,Link,Name,${statusHeader}Type,Status,Resolution\n`;

      dataSource.forEach(item => {
        let statusColumns = "";
        statuses.forEach(status => {
          switch (args) {
            case "all":
              statusColumns += "IMPLEMENT,";
              break;
            case "time":
              statusColumns += "IMPLEMENT,";
              break;
            case "dateandtime":
              statusColumns +=
                (item.data[status]
                  ? super.transform(item.data[status], "yyyy-MM-dd hh:mm:ss")
                  : "") + ",";
              break;
            case "date":
            default:
              statusColumns +=
                (item.data[status]
                  ? super.transform(item.data[status], "yyyyMMdd")
                  : "") + ",";
              break;
          }
        });

        response += `${item.key},https://smith-nephew.atlassian.net/browse/${item.key},${item.title},${statusColumns}${item.type},${item.status},${item.resolution}\n`;
      });

      return response;
    }
    return "invalid data";
  }
}

import { Inject, Injectable, InjectionToken } from "@angular/core";
import { Headers, Http } from "@angular/http";
import { Observable, merge, zip } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private headers: Headers = new Headers({
    "Content-type": "application/json"
  });
  private jiraUrl: string = "https://jira.ryanair.com:8443/rest/api/2/";
  private username: string = "username";
  private pass: string = "password";

  constructor(private http: Http) {}

  private setAuth(username: string, pass: string) {
    this.username = username;
    this.pass = pass;
    this.headers.append(
      "Authorization",
      "Basic " + window.btoa(`${username}:${pass}`)
    );
  }

  private getIssues(jqlString: string): Observable<any> {
    return this.post(`${this.jiraUrl}search`, {
      jql: jqlString,
      maxResults: 100,
      expand: ["changelog", "names"]
    });
  }

  private post(url: string, body: any): Observable<any> {
    return this.http
      .post(url, body, { headers: this.headers, withCredentials: true })
      .pipe(map((response, any) => response.json()));
  }

  private handleError(error: any): void {
    console.log(error);
  }

  public getDaysPerStatus(query: string): Observable<any> {
    var obs = this.getData(query).pipe(
      map(data => {
        let a: Array<any> = [];
        data.issues.forEach(issue => {
          //console.log("issue:");console.dir(issue);
          a.push({
            key: issue.key,
            title: issue.fields.summary,
            created: issue.fields.created,
            updated: issue.fields.updated,
            issuetype: issue.fields.issuetype.name,
            project: issue.fields.project.name,
            team: issue.fields.customfield_11716.value,
            estimate: issue.fields.customfield_10002,
            status: issue.fields.status.name,
            statusId: issue.fields.status.id,
            statusHistory: (function(changelog) {
              let statusHistory: Array<any> = [];
              changelog.histories.forEach(history => {
                let statusHistoryItem = history.items.filter(
                  historyItem => historyItem.field == "status"
                );
                if (statusHistoryItem.length > 0) {
                  //console.log("statushistoryitems: "); console.dir(statusHistoryItem);
                  let sh = {
                    fromDateTime:
                      statusHistory.length > 0
                        ? statusHistory[statusHistory.length - 1].toDateTime
                        : issue.fields.created,
                    toDateTime: history.created,
                    transitionDurationHours: 0,
                    transitionDurationDays: 0,
                    from: statusHistoryItem[0]["fromString"],
                    to: statusHistoryItem[0]["toString"]
                  };
                  sh.transitionDurationHours =
                    Math.abs(
                      new Date(sh.toDateTime).getTime() -
                        new Date(sh.fromDateTime).getTime()
                    ) /
                    (1000 * 60 * 60);
                  sh.transitionDurationDays =
                    Math.abs(
                      new Date(sh.toDateTime).getTime() -
                        new Date(sh.fromDateTime).getTime()
                    ) / 86400000;
                  statusHistory.push(sh);
                }
              });
              //console.log("statusHistory:");console.dir(statusHistory);
              return statusHistory;
            })(issue.changelog)
          });
        });
        return a;
      })
    );
    return obs;
  }

  public getData(query: string): Observable<any> {
    return this.getIssues(query);
  }
}

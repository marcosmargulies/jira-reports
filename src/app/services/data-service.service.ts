import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable, merge, zip } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private headers: Headers = new Headers({
    'Content-type': 'application/json'
  });
  private jiraUrl = 'https://jira.ryanair.com:8443/rest/api/2/';
  private username = 'username';
  private pass = 'password';

  constructor(private http: Http) { }

  private setAuth(username: string, pass: string) {
    this.username = username;
    this.pass = pass;
    this.headers.append(
      'Authorization',
      'Basic ' + window.btoa(`${username}:${pass}`)
    );
  }

  private getIssues(jqlString: string): Observable<any> {
    return this.post(`${this.jiraUrl}search`, {
      jql: jqlString,
      maxResults: 100,
      expand: ['changelog', 'names']
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
    const obs = this.getData(query).pipe(
      map(data => {
        const a: Array<any> = [];
        data.issues.forEach(issue => {
          // console.log("issue:"); console.dir(issue);
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
            statusHistory: (function (changelog) {
              const filteredStatusHistory: Array<any> = [];
              const statusHistory: Array<any> = [];
              changelog.histories.forEach(history => {
                const statusHistoryItem = history.items.filter(
                  historyItem => historyItem.field === 'status'
                );
                if (statusHistoryItem.length > 0) {
                  statusHistoryItem.created = history.created;
                  filteredStatusHistory.push(statusHistoryItem);
                }
              });
              for (let _i = 0; _i < filteredStatusHistory.length; _i++) {
                const status = filteredStatusHistory[_i];
                const sh = {
                  fromDateTime:
                    statusHistory.length > 0
                      ? statusHistory[statusHistory.length - 1].toDateTime
                      : issue.fields.created,
                  toDateTime: status.created,
                  transitionDurationHours: 0,
                  transitionDurationDays: 0,
                  from: status[0]['fromString'],
                  to: status[0]['toString']
                }
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

                if (_i === filteredStatusHistory.length - 1) { // Add last status
                  const last = {
                    fromDateTime: status.created,
                    toDateTime: Date.now(),
                    transitionDurationHours: 0,
                    transitionDurationDays: 0,
                    from: status[0]['toString'],
                  };
                  last.transitionDurationHours =
                    Math.abs(
                      new Date(last.toDateTime).getTime() -
                      new Date(last.fromDateTime).getTime()
                    ) /
                    (1000 * 60 * 60);
                  last.transitionDurationDays =
                    Math.abs(
                      new Date(last.toDateTime).getTime() -
                      new Date(last.fromDateTime).getTime()
                    ) / 86400000;
                  statusHistory.push(last);
                }
              }
              return statusHistory;
              // console.log("statusHistory:");console.dir(statusHistory);
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

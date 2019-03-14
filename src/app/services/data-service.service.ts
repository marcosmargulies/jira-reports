import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private headers: Headers = new Headers({ 'Content-type': 'application/json' });
  private jiraUrl: string = 'https://jira.ryanair.com:8443/rest/api/2/';
  private username: string = 'user';
  private pass: string = 'password';

  constructor(private http: Http) {
  }

  private setAuth(username: string, pass: string) {
    this.username = username;
    this.pass = pass;
    this.headers.append('Authorization', 'Basic ' + window.btoa(`${username}:${pass}`));
  }

  private getIssues(jqlString: string): Observable<any> {
    return this.post(`${this.jiraUrl}search`,
      { jql: jqlString, maxResults: 100, expand: ['changelog', 'names'] });
  }

  private post(url: string, body: any): Observable<any> {
    return this.http.post(url, body, { headers: this.headers, withCredentials: true })
      .pipe(map((response, any) => response.json()))
  }

  private handleError(error: any): void {
    console.log(error);
  }

  public getDaysPerStatus(query: string): Observable<any> {
    return this.getData(query)
      .pipe(map((data, any) => {
        console.log(data.issues);
        return data.issues;
      }))
      .pipe(map((ticket, any) => {
        console.log(ticket.key);
        return ticket.key;
      }));
  }

  public getData(jql: string): Observable<any> {
    // let data:Array<any> = [];
    //let jql: string = "project = \"Trip Planner\" AND \"Scrum Team\" in (Scrumdogs) AND Sprint in openSprints() AND type in (Story)";
    return this.getIssues(jql);

  }
}

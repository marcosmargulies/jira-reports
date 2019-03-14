import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable,merge,zip } from 'rxjs';
import { map,pluck,concatMap,flatMap,filter,mergeMap,mergeAll,combineAll,concatAll,reduce } from 'rxjs/operators';
import { SlicePipe } from '@angular/common/src/pipes';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private headers: Headers = new Headers({'Content-type': 'application/json'});
  private jiraUrl:string = 'https://jira.ryanair.com:8443/rest/api/2/';
  private username:string = 'lisiewiczt';
  private pass:string = 'Wiosna.2019';

  constructor(private http:Http) {
  }

  private setAuth(username:string, pass:string) {
    this.username = username;
    this.pass = pass;
    this.headers.append('Authorization', 'Basic ' + window.btoa(`${username}:${pass}`));    
  }

  private getIssues(jqlString: string): Observable<any> {
    return this.post(`${this.jiraUrl}search`, 
      { jql: jqlString, maxResults: 100, expand: ['changelog','names'] });
	}

  private post(url: string, body: any): Observable<any> {
    return this.http.post(url, body, { headers: this.headers, withCredentials: true })
      .pipe(map((response,any) => response.json()))
  }
  
  private handleError(error:any):void {
    console.log(error);
  }

public getDaysPerStatus():Observable<any> {
  var obs = this.getData()
    .pipe(map((data) => {
      let a:Array<any> = [];
      data.issues.forEach(issue => {
        console.log("issue:");console.dir(issue);
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
            let statusHistory:Array<any> = [];
            changelog.histories.forEach(history => {
              let statusHistoryItem = history.items.filter((historyItem) => historyItem.field == "status");
              if (statusHistoryItem.length > 0) {
                //console.log("statushistoryitems: "); console.dir(statusHistoryItem);
                let sh = {
                  fromDateTime: statusHistory.length > 0 ? statusHistory[statusHistory.length-1].toDateTime : issue.fields.created,
                  toDateTime: history.created,
                  transitionDurationHours: 0,
                  transitionDurationDays: 0,
                  from: statusHistoryItem[0]["fromString"],
                  to: statusHistoryItem[0]["toString"]
                };
                sh.transitionDurationHours = Math.abs(new Date(sh.toDateTime).getTime() - new Date(sh.fromDateTime).getTime()) / (1000*60*60);
                sh.transitionDurationDays = Math.abs(new Date(sh.toDateTime).getTime() - new Date(sh.fromDateTime).getTime()) / (86400000);
                statusHistory.push(sh);
              }
            });
            console.log("statusHistory:");console.dir(statusHistory);
            return statusHistory;
          })(issue.changelog)
        });
      });
      return a;
    }));
    return obs;
}

  public getData():Observable<any> {
    // let data:Array<any> = [];
    let jql:string = "project = \"Trip Planner\" AND \"Scrum Team\" in (Scrumdogs) AND Sprint in openSprints() AND type in (Story, Bug, \"Story Bug\", \"Test Bug\", Change, \"Content Change\", \"Design Task\", Improvement, Incident, \"New Feature\", Task, Problem, Request, Requirement, \"Service Request\")";
    return this.getIssues(jql);
    

    
    // let data:Array<any> = [
    //   { data: [23.6514946519796, 3.31491141831972, 0.668417511820244, 0.969977977951708, 0, 1.23725997244995, 2.54439801743686], label: 'Average ' },
    //   { data: [0, 0, 0, 0, 0, 0, 0], label: 'TP-3069' },
    //   { data: [0.0325810185185185, 1.15740740740741E-05, 0, 0.135486111111111, 0, 0.632820544222222, 0], label: 'TP-3067' },
    //   { data: [0.103206018518519, 0.00813657407407407, 0, 0.713053437436343, 0, 0, 0], label: 'TP-3065' },
    //   { data: [0.0822685185185185, 0.0522337962962963, 0, 0.713090330570602, 0, 0, 0], label: 'TP-3057' },
    //   { data: [0, 0, 0, 0, 0, 0, 0], label: 'TP-3053' },
    //   { data: [0.000104166666666667, 0.0660185185185185, 1.61304674146991, 0, 0, 0, 0], label: 'TP-3033' },
    //   { data: [0, 0.137233796296296, 0, 0.712534722222222, 0, 0, 0.920328113461806], label: 'TP-3029' },
    //   { data: [0, 0.828576388888889, 0, 0.121203703703704, 0, 0, 1.76663724189815], label: 'TP-3009' },
    //   { data: [5.89165509259259, 0.0325578703703704, 0, 0.197800925925926, 0, 0.828877314814815, 0.85064339347338], label: 'TP-2921' },
    //   { data: [6.08928240740741, 0, 1.8745336605787, 0, 0, 0, 0], label: 'TP-2894' },
    //   { data: [0, 1.94884259259259, 0, 2.86725694444444, 0, 3.15666666666667, 0.742035267180556], label: 'TP-2884' },
    //   { data: [9.0334837962963, 0.00150462962962963, 1.87480290370139, 0, 0, 0, 0], label: 'TP-2810' },
    //   { data: [3.06446759259259, 2.31481481481481E-05, 0, 3.47222222222222E-05, 0, 2.90142361111111, 0.851251071665509], label: 'TP-2806' },
    //   { data: [10.7182060185185, 2.98599777380903, 0, 0, 0, 0, 0], label: 'TP-2802' },
    //   { data: [5.87603009259259, 4.14237268518518, 0, 1.99101851851852, 0, 0.972939814814815, 0.793036872177083], label: 'TP-2798' },
    //   { data: [15.9372106481481, 8.84865179470139, 0, 0, 0, 0, 0], label: 'TP-2736' },
    //   { data: [15.0288657407407, 0.908888888888889, 0.0183101851851852, 0.10568287037037, 0, 0, 8.72559759901157], label: 'TP-2735' },
    //   { data: [13.9298726851852, 2.31481481481481E-05, 0, 0.957569444444444, 0, 0, 9.93758959956713], label: 'TP-2734' },
    //   { data: [25.9505787037037, 0.102708333333333, 0, 0.998657407407407, 0, 0.632938564233796, 0], label: 'TP-2733' },
    //   { data: [36.2101967592593, 0.0122337962962963, 0, 0, 0, 0, 8.7291204929838], label: 'TP-2321' },
    //   { data: [35.2270138888889, 1.96340277777778, 0, 4.79028935185185, 0, 3.12920138888889, 0.805639170880787], label: 'TP-2275' },
    //   { data: [30.7611458333333, 13.282337962963, 0, 3.74684027777778, 0, 0.923090277777778, 10.0102831434664], label: 'TP-1973' },
    //   { data: [83.9548726851852, 0.17224537037037, 0, 1.08482638888889, 0, 0.917256944444444, 0.762171923583333], label: 'TP-1462' },
    //   { data: [55.9306481481481, 3.08574074074074, 0, 0.257222222222222, 0, 13.8443402777778, 13.774998168125], label: 'TP-1457' },
    //   { data: [62.0352083333333, 17.3455208333333, 0, 1.92881944444444, 0, 1.85387731481481, 3.73095003411227], label: 'TP-1454' },
    //   { data: [58.1915625, 10.9238232294282, 14.0034143518519, 1.88407407407407, 0, 1.90363425925926, 0], label: 'TP-1451' },
    //   { data: [58.1869444444444, 21.9545717592593, 0, 2.86716435185185, 0, 3.12959490740741, 0.769034530231481], label: 'TP-1449' },
    //   { data: [76.5451273148148, 6.69824074074074, 0, 2.01155092592593, 0, 1.04091435185185, 0.692774788668981], label: 'TP-1442' },
    //   { data: [77.1128125, 0.630532407407407, 0, 0.0451851851851852, 0, 0.012962962962963, 9.92545109518171], label: 'TP-1405' }
    // ];
    // return data;
  }
}

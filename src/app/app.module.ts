import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ChartsModule } from "ng2-charts";
import { SearchBarComponent } from "./search-bar/search-bar.component";
import { ChartAreaComponent } from "./chart-area/chart-area.component";
import { DataService } from "src/app/services/data-service.service";
import { HttpClientModule } from "@angular/common/http";

import { Routes, RouterModule } from "@angular/router";
import { TestchartComponent } from "./testchart/testchart.component";
import { Ng2GoogleChartsModule } from "ng2-google-charts";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ArrayToCsvPipe } from "./pipes/array-to-csv.pipe";

const appRoutes: Routes = [
  {
    path: "report",
    component: ChartAreaComponent
  },
  { path: "testchart", component: TestchartComponent },
  { path: "", redirectTo: "report", pathMatch: "full" },
  { path: "**", redirectTo: "report" }
];

@NgModule({
  declarations: [
    AppComponent,
    SearchBarComponent,
    ChartAreaComponent,
    TestchartComponent,
    ArrayToCsvPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ChartsModule,
    CommonModule,
    FormsModule,
    Ng2GoogleChartsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    DragDropModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [DataService, ArrayToCsvPipe],
  bootstrap: [AppComponent]
})
export class AppModule {}

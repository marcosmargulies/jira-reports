import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';
import { HttpModule } from '@angular/http';
import { DataService } from 'src/app/services/data-service.service';

@NgModule({
  declarations: [
    AppComponent,
    SearchBarComponent,
    ChartAreaComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    ChartsModule,
    CommonModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }

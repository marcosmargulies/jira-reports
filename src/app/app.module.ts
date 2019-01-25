import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchBarComponent,
    ChartAreaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

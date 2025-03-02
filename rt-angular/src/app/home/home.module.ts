import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { HomeAuthResolver } from './home-auth-resolver.service';
import { SharedModule, SidebarComponent } from '../shared/';
// import {LandingComponent} from "../landing/landing.component";
// import {NoAuthGuard} from "../login/no-auth-guard.service";
import {DashboardComponent} from './dashboard/dashboard.component';
import {ChartComponent} from './dashboard/chart/chart.component';
import {HttpClientModule} from '@angular/common/http';
import {AuthGuardService} from '../shared/services';
import {LandingComponent} from '../landing/landing.component';
import {NoAuthGuard} from '../login/no-auth-guard.service';
import {ApiComponent} from '../api/api.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileSummaryComponent } from './dashboard/profile-summary/profile-summary.component';
import { RiderEventsComponent } from './rider-events/rider-events.component';
import { LastrunSummaryComponent } from './dashboard/lastrun-summary/lastrun-summary.component';
import { MystatsSummaryComponent } from './dashboard/mystats-summary/mystats-summary.component';
import { AdminEventsComponent } from './admin-events/admin-events.component';
import {EventDetailComponent} from './rider-events/event-detail/event-detail.component';
import { MyEventsComponent } from './my-events/my-events.component';
import {ActivityService} from "../shared/services/activity.service";
// import {Validators} from "@angular/forms";

const homeRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'api',
    component: ApiComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuardService],
    resolve: {
      isAuthenticated: HomeAuthResolver
    },
    children: [
      {path: '', redirectTo: 'dashboard', canActivate: [AuthGuardService], pathMatch: 'full'},
      { path: 'dashboard' , canActivate: [AuthGuardService], component: DashboardComponent},
      {path: 'riderEvents' , canActivate: [AuthGuardService], component: RiderEventsComponent},
      {path: 'adminEvents' , canActivate: [AuthGuardService], component: AdminEventsComponent},
      {path: 'profile', canActivate: [AuthGuardService], component: ProfileComponent},
      {path: 'myEvents' , canActivate: [AuthGuardService], component: MyEventsComponent},
      {path: 'detail', canActivate: [AuthGuardService], component: EventDetailComponent}]
  }
]);

@NgModule({
  imports: [
    homeRouting,
    HttpClientModule,
    SharedModule
  ],
  declarations: [
    HomeComponent,
    SidebarComponent,
    DashboardComponent,
    ChartComponent,
    ProfileComponent,
    ProfileSummaryComponent,
    RiderEventsComponent,
    LastrunSummaryComponent,
    MystatsSummaryComponent,
    AdminEventsComponent,
    MyEventsComponent,
    EventDetailComponent
  ],
  providers: [
    HomeAuthResolver,
    ActivityService
  ]
})
export class HomeModule {}

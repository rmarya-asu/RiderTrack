import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {User} from '../models';
import {Api_Response} from "../models/api_response.model";
import { distinctUntilChanged, map } from 'rxjs/operators';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {ApiService} from './api.service';
import {HttpClient} from '@angular/common/http';
import {JwtService} from './jwt.service';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class UserService {

  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  response: 'String';
  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor (
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService
  ) {}


  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
        .subscribe(
          data => this.setAuth(data.user),
          err => this.purgeAuth()
        );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(type, credentials): Observable<User> {
    const route = (type === 'login') ? '/login' : '';
    // return this.apiService.post('/users' + route, {email: credentials.email, password:credentials.password})
    return this.apiService.post('/users' + route, credentials)
      .pipe(map(
        data => {

          this.setAuth(data.user);
          return data;
        }
      ));
  }


  generate_new_pwd(credentials): Observable<Api_Response> {
    const route = '/forgotpwd';
    console.log('inside generate_new_pwd');
    //make post request with email to /users/forgotpwd
    return this.apiService.post('/users'+route, credentials)
      .pipe(map(data=>{
        if(data.result){
          return data;
        }
        else{
         console.log('failure');
        }
    }));
  }


  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  // Update the user on the server (email, pass, etc)
  update(user): Observable<User> {
    return this.apiService
      .put('/user', { user })
      .pipe(map(data => {
        // Update the currentUser observable
        this.currentUserSubject.next(data.user);
        return data.user;
      }));
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
export type ToastType = 'success' | 'error' | 'warning' | 'info'
export interface ToastData {
  type: ToastType;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastData>();
  toast$ = this.toastSubject.asObservable();
  show(type: ToastType, message: string){
    this.toastSubject.next({type, message})
  }
  success(message: string){
    this.show('success',message);
  }
  
  error(message: string){
    this.show('error',message);
  }
  
  warning(message: string){
    this.show('warning',message);
  }

  
  info(message: string){
    this.show('info',message);
  }
  constructor() { }
}

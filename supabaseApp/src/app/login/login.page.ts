import { SupabaseService } from './../services/supabase.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
 
  credentials: FormGroup;
 
  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    private supabaseService: SupabaseService
  ) { }
 
  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
 
  async login() {
    const loading = await this.loadingController.create();
    await loading.present();
 
    this.supabaseService.signIn(this.credentials.value).then(async data => {
      await loading.dismiss();
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }, async err => {
      await loading.dismiss();
      this.showAlert('Login failed', err.message);
    });
  }
 
  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();
 
    this.supabaseService.signUp(this.credentials.value).then(async data => {
      await loading.dismiss();
      this.showAlert('Signup success', 'Please confirm your email now!');
    }, async err => {      
      await loading.dismiss();
      this.showAlert('Registration failed', err.message);
    });
  }
 
  async showAlert(title, msg) {
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
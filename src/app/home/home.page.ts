// author: Kevin Omar Yañez Bran
import { Component } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  username: string = '';
  password: string = '';
  isValid: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  validateForm() {
    this.username = this.username.toLowerCase().replace(/\s/g, '');
    this.password = this.password.replace(/\s/g, '');
    this.isValid = this.username.length > 0 && this.password.length > 0;
  }


  async login() {
    const loading = await this.loadingCtrl.create({
      message: 'Ingresando...',
      duration: 3000,
      spinner: 'crescent',
    });

    await loading.present();

    setTimeout(() => {
      this.router.navigate(['/home2']);
    }, 3000);
  }
}

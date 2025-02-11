import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';

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

  constructor(private modalCtrl: ModalController) {}

  validateForm() {
    // Convertir username a minúsculas y eliminar espacios
    this.username = this.username.toLowerCase().replace(/\s/g, '');
    this.password = this.password.replace(/\s/g, '');

    // Verificar que ambos campos no estén vacíos
    this.isValid = this.username.length > 0 && this.password.length > 0;
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: {
        username: this.username,
        password: this.password,
      },
    });

    await modal.present();
  }
}

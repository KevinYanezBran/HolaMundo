import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';

interface User {
  mail: string;
  fullName: string;
  user: string;
  password: string;
  birthDate: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  mail: string = '';
  fullName: string = '';
  user: string = '';
  password: string = '';
  confirmPassword: string = '';
  birthDate: string = '';

  isValid: boolean = false;
  users: User[] = [];

  // Propiedades de error
  mailError: string = '';
  userError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor(private modalCtrl: ModalController) {}

  validateForm() {
    this.mailError = '';
    this.userError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.mail.trim()) {
      this.mailError = 'El correo es obligatorio.';
    } else if (/\s/.test(this.mail)) {
      this.mailError = 'El correo no debe contener espacios.';
    } else if (!emailRegex.test(this.mail)) {
      this.mailError = 'El correo no tiene un formato válido.';
    }

    // Validación de usuario
    if (!this.user.trim()) {
      this.userError = 'El usuario es obligatorio.';
    } else if (/\s/.test(this.user)) {
      this.userError = 'El usuario no debe contener espacios.';
    }

    // Validación de contraseña
    if (!this.password.trim()) {
      this.passwordError = 'La contraseña es obligatoria.';
    } else if (/\s/.test(this.password)) {
      this.passwordError = 'La contraseña no debe contener espacios.';
    }

    // Validación de confirmación de contraseña
    if (this.confirmPassword.trim() && this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden.';
    }

    // Convertir fullName a mayúsculas
    this.fullName = this.fullName.toUpperCase().trim();

    // Validación de formulario general
    this.isValid =
      !this.mailError &&
      !this.userError &&
      !this.passwordError &&
      !this.confirmPasswordError &&
      this.fullName.length > 0 &&
      this.birthDate.length > 0;
  }

  async registerUser() {
    if (this.isValid) {
      const newUser: User = {
        mail: this.mail,
        fullName: this.fullName,
        user: this.user,
        password: this.password,
        birthDate: this.birthDate,
      };

      this.users.push(newUser);

      // Abrir modal con los datos registrados
      const modal = await this.modalCtrl.create({
        component: ModalContentPage,
        componentProps: { user: newUser },
      });

      await modal.present();

      this.resetForm();
    }
  }

  resetForm() {
    this.mail = '';
    this.fullName = '';
    this.user = '';
    this.password = '';
    this.confirmPassword = '';
    this.birthDate = '';
    this.mailError = '';
    this.userError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.isValid = false;
  }
}

@Component({
  selector: 'app-modal-content',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-content class="ion-padding">
      <div class="modal-container">
        <h2>Registro Exitoso</h2>
        <p><strong>Nombre:</strong> {{ user.fullName }}</p>
        <p><strong>Usuario:</strong> {{ user.user }}</p>
        <p><strong>Email:</strong> {{ user.mail }}</p>
        <p><strong>Contraseña:</strong> {{ user.password }}</p>
        <p><strong>Fecha de Nacimiento:</strong> {{ user.birthDate }}</p>
        <ion-button expand="full" (click)="closeModal()">Cerrar</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .modal-container {
      text-align: center;
    }
    h2 {
      color: #4caf50;
    }
    p {
      font-size: 1.2rem;
      margin: 5px 0;
    }
  `]
})
export class ModalContentPage {
  user: any;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
}

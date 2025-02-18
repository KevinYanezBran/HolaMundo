// author: Kevin Omar Yañez Bran
import { Component } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import * as bcrypt from 'bcryptjs';

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
  role: string = 'user';

  isValid: boolean = false;

  // ✅ Validaciones de error
  mailError: string = '';
  userError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor(private firestore: Firestore, private auth: Auth, private loadingCtrl: LoadingController) {}

  // ✅ Mantener `validateForm()`
  validateForm() {
    this.mailError = '';
    this.userError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.mail.trim()) {
      this.mailError = 'El correo es obligatorio.';
    } else if (!emailRegex.test(this.mail)) {
      this.mailError = 'El correo no tiene un formato válido.';
    }

    if (!this.user.trim()) {
      this.userError = 'El usuario es obligatorio.';
    } else if (/\s/.test(this.user)) {
      this.userError = 'El usuario no debe contener espacios.';
    }

    if (!this.password.trim()) {
      this.passwordError = 'La contraseña es obligatoria.';
    } else if (/\s/.test(this.password)) {
      this.passwordError = 'La contraseña no debe contener espacios.';
    }

    if (this.confirmPassword.trim() && this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden.';
    }

    this.fullName = this.fullName.toUpperCase().trim();

    this.isValid =
      !this.mailError &&
      !this.userError &&
      !this.passwordError &&
      !this.confirmPasswordError &&
      this.fullName.length > 0 &&
      this.birthDate.length > 0;
  }

  // ✅ Adaptar `registerUser()` para Firebase con `LoadingController`
  async registerUser() {
    if (!this.isValid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Registrando usuario...',
      duration: 3000,
      spinner: 'crescent',
    });

    await loading.present();

    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.mail, this.password);
      const userId = userCredential.user.uid;

      await addDoc(collection(this.firestore, 'users'), {
        id: userId,
        email: this.mail,
        fullName: this.fullName,
        username: this.user,
        password: hashedPassword,
        birthDate: this.birthDate,
        role: this.role,
        last_login: new Date(),
      });

      alert('Usuario registrado exitosamente');
      this.resetForm();
    } catch (error) {
      console.error('Error en el registro:', error);
      alert('Error al registrar usuario');
    } finally {
      loading.dismiss();
    }
  }

  resetForm() {
    this.mail = '';
    this.fullName = '';
    this.user = '';
    this.password = '';
    this.confirmPassword = '';
    this.birthDate = '';
    this.role = 'user';
    this.mailError = '';
    this.userError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.isValid = false;
  }
}

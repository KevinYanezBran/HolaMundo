// author: Kevin Omar Yañez Bran
import { Component, inject } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Firestore, collection, getDocs, query, where, DocumentData } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

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

  private firestore = inject(Firestore);
  private auth = inject(Auth);

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

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.username, this.password);
      const userId = userCredential.user.uid;

      const usersCollection = collection(this.firestore, 'users');
      const q = query(usersCollection, where('id', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData: DocumentData = querySnapshot.docs[0].data();

        const userRole = userData['role'];
        const userPermissions = await this.getPermissions(userRole);

        const token = JSON.stringify({
          uid: userId,
          role: userRole,
          permissions: userPermissions,
        });

        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        alert('Inicio de sesión exitoso');

        // Redirigir según el rol
        if (userRole === 'admin') {
          this.router.navigate(['/admin-users']);
        } else {
          this.router.navigate(['/home2']);
        }
      } else {
        alert('Usuario no encontrado en la base de datos.');
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Usuario o contraseña incorrectos');
    } finally {
      loading.dismiss();
    }
  }

  async getPermissions(role: string): Promise<string[]> {
    const rolesCollection = collection(this.firestore, 'roles');
    const q = query(rolesCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const roleData = querySnapshot.docs[0].data();
      return roleData['permissions'] || [];
    }
    return [];
  }
}
